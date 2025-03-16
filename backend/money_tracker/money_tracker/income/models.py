from django.db import models
from money_tracker.currencies.models import Currency, ExchangeRate
from django.conf import settings
from django.core.exceptions import ValidationError
from .mixins import CurrencyConversionMixin
from django.db import transaction
from django.db.utils import IntegrityError
from django.utils import timezone
from decimal import Decimal, ROUND_DOWN, ROUND_HALF_UP
import logging
User = settings.AUTH_USER_MODEL
logger = logging.getLogger(__name__)

# Create your models here.
class BaseIncome(models.Model, CurrencyConversionMixin):
    income_name = models.CharField(max_length=100, null=False, blank=False)
    currency = models.ForeignKey(Currency, on_delete=models.PROTECT, null=False, blank=False)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    amount_lcy = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="%(class)s_created_by", related_query_name="%(class)s_created_by", null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="%(class)s_modified_by", related_query_name="%(class)s_modified_by", null=True, blank=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=["income_name"]),
            models.Index(fields=["created_at"]),
        ]
        # CheckConstraint for non-negative amounts
        constraints = [
            models.CheckConstraint(check=models.Q(amount__gte=0), name="%(class)s_amount_gte_zero"),
            models.CheckConstraint(check=models.Q(amount_lcy__gte=0), name="%(class)s_amount_lcy_gte_zero"),
        ]
        ordering = ["-created_at"]
        get_latest_by = ['-created_at']

    def clean(self):
        super().clean()

        # Validate amount
        if self.amount < 0:
            raise ValidationError({"amount": "Amount must be a non-negative value."})

        # Validate currency
        if not self.currency:
            raise ValidationError({"currency": "A valid currency must be provided."})

    def save(self, *args, **kwargs):
        is_new = self._state.adding

        if not is_new and not self.modified_by:
            raise ValidationError("modifier must be specified for updating a record.")

        try:
            with transaction.atomic():
                self.amount_lcy = Decimal(self.convert_to_lcy(self.amount, self.currency)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                self.full_clean()  # Validate the model before saving
                super().save(*args, **kwargs)
        except Exception as e:
            logger.exception(f"An error occurred while saving the income at {timezone.now()}: {str(e)}")
            raise ValidationError("An error occurred while saving the income. Please check the data.")

class EarnedIncome(BaseIncome):
    # salaries, side hustle, income from services offered, freelancing income
    def __str__(self):
        return f'Earned Income: name - {self.income_name}; amount - {self.amount}'
    class Meta(BaseIncome.Meta):
        verbose_name = "Earned Income"
        verbose_name_plural = "Earned Income"

class PortfolioIncome(BaseIncome):
    # amount of money that you get from your investment asset
    # income from stocks, dividends, bonds, and capital gains is categorized as portfolio income
    def __str__(self):
        return f'Portfolio Income: name - {self.income_name}; amount - {self.amount}'
    class Meta(BaseIncome.Meta):
        verbose_name = "Portfolio Income"
        verbose_name_plural = "Portfolio Income"

class PassiveIncome(BaseIncome):
     # money that you earn with minimal effort from the resources that you have invested in
    # examples:music royalties, owner’s equity, interest from savings accounts, and rent from your personal properties
    def __str__(self):
        return f'Passive Income: name - {self.income_name}; amount - {self.amount}'
    class Meta(BaseIncome.Meta):
        verbose_name = "Passive Income"
        verbose_name_plural = "Passive Income"
