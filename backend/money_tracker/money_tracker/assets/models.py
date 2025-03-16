from django.db import models
from django.conf import settings
User = settings.AUTH_USER_MODEL
from money_tracker.currencies.models import Currency
from .mixins import CurrencyConversionMixin
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import transaction
from django.utils import timezone
from decimal import Decimal, ROUND_HALF_UP
import logging
logger = logging.getLogger(__name__)

# Create your models here.        
class BaseAsset(models.Model, CurrencyConversionMixin):
    """Abstract base model for financial assets."""
    name = models.CharField(max_length=100, null=False, blank=False)
    currency = models.ForeignKey(Currency, on_delete=models.PROTECT, null=False, blank=False)
    amount = models.DecimalField(max_digits=20, decimal_places=2, validators=[MinValueValidator(Decimal('0'))])
    amount_lcy = models.DecimalField(max_digits=20, decimal_places=2, default=0.00, validators=[MinValueValidator(Decimal('0'))])
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="%(class)s_creator")
    created_at = models.DateTimeField(auto_now_add=True)
    modified_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="%(class)s_modifier", blank=True, null=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["id"]
        get_latest_by = "created_at"

    def save(self, *args, **kwargs):
        if not self._state.adding and not self.modified_by:
            raise ValidationError("modifier must be specified for updating a record.")

        try:
            with transaction.atomic():
                self.amount_lcy = Decimal(self.convert_to_lcy(self.amount, self.currency)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                self.full_clean()
                super().save(*args, **kwargs)
        except Exception as e:
            logger.exception(f"Error saving {self.__class__.__name__} at {timezone.now()}: {str(e)}")
            raise ValidationError("An error occurred while saving. Please check the data.")

class LiquidAsset(BaseAsset):
    """Liquid financial resources (e.g., cash, bank deposits).
    financial resources that can be easily transformed into cash without a major loss of value e.g. cash, bank deposits
    """
    source = models.CharField(max_length=50, unique=True)

    class Meta(BaseAsset.Meta):
        verbose_name_plural = "Liquid Assets"

    def __str__(self):
        return f"Liquid Asset: {self.source}, Amount: {self.currency} {self.amount}"

class Equity(BaseAsset):
    """Equity in a business or company."""
    ratio = models.DecimalField(max_digits=4, decimal_places=2, default=0.3, validators=[MinValueValidator(Decimal("0.01")), MaxValueValidator(Decimal("1.00"))])

    class Meta(BaseAsset.Meta):
        verbose_name_plural = "Equities"

    def __str__(self):
        return f"Equity in {self.name}, amount: {self.currency} {self.amount}, with a ratio of {self.ratio}"

class InvestmentAccount(BaseAsset):
    """Investment accounts like money market funds."""
    class Meta(BaseAsset.Meta):
        verbose_name_plural = "Investment Accounts"

    def __str__(self):
        return f"Investment in {self.name}, amount: {self.currency} {self.amount} as of {self.created_at:%B %Y}"

class RetirementAccount(BaseAsset):
    """Retirement savings accounts."""
    employer = models.CharField(max_length=65, null=True, blank=True)

    class Meta(BaseAsset.Meta):
        verbose_name_plural = "Retirement Accounts"

    def __str__(self):
        return f"Retirement savings in {self.name} by employer {self.employer} with amount: {self.currency} {self.amount} as of {self.created_at:%B %Y}"
