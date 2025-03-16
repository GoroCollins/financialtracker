from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.core.validators import MinValueValidator
from django.conf import settings
from decimal import Decimal, ROUND_HALF_UP
from django.db import transaction
from django.db.utils import IntegrityError
import logging
from django.core.cache import cache
from django.db.models.functions import TruncDate
User = settings.AUTH_USER_MODEL
logger = logging.getLogger(__name__)

# Create your models here.
class Currency(models.Model):
    code = models.CharField(
        max_length=5,
        validators=[
            RegexValidator(r"^[A-Z]{3}$", "Currency code must be 3 uppercase letters.")
        ],
        primary_key=True
    )
    description = models.CharField(max_length=100, null=False, blank=False)
    is_local = models.BooleanField(null=False, blank=False)
    created_by = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name='ccreator', related_query_name='ccreator'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    modified_by = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name='cmodifier', related_query_name='cmodifier', blank=True, null=True
    )
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f'{self.code} - {self.description}'
    
    def clean(self):
        if self.is_local:
            # Check if another local currency exists
            existing_local = Currency.objects.filter(is_local=True).exclude(pk=self.pk).first()
            if existing_local:
                raise ValidationError("Only one local currency is allowed.")
        # Allow foreign currency only if at least one currency exists else raise an error
        else:  
            # Ensure at least one local currency exists
            if not Currency.objects.filter(is_local=True).exists():
                raise ValidationError("Cannot set this currency as foreign; no local currency exists.")

    def save(self, *args, **kwargs):
        """Ensure modified_by is set when updating a record and handle validation."""
        is_new = self._state.adding  # True if creating a new record

        if not is_new and not self.modified_by:
            raise ValidationError("modifier must be specified for updating a record.")

        try:
            with transaction.atomic():
                self.full_clean()  # Validate the model before saving
                super().save(*args, **kwargs)
        except IntegrityError as e:
            logger.error(f"IntegrityError while saving Currency {self.code}: {str(e)}")
            if "unique_local_currency" in str(e):  # Check if the error is related to the local currency constraint
                raise ValidationError("Only one local currency is allowed.")
            else:
                raise ValidationError("An error occurred while saving the currency. Please check the data.")
    
    def delete(self, *args, **kwargs):
        """Prevent deletion of the only local currency if foreign currencies exist."""
        if self.is_local:
            # Check if there are foreign currencies
            foreign_currencies_exist = Currency.objects.filter(is_local=False).exists()
            if foreign_currencies_exist:
                raise ValidationError("Cannot delete the only local currency while foreign currencies exist.")
        
        super().delete(*args, **kwargs)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["is_local"],
                condition=models.Q(is_local=True),
                name="unique_local_currency"
            )
        ]
        indexes = [
            models.Index(fields=["is_local"]),
            models.Index(fields=["code"])
        ]
        verbose_name_plural = "Currencies"

class ExchangeRate(models.Model):
    currency = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        related_name='exchange_rates',
        related_query_name='exchange_rate',
        blank=False,
        null=False
    )
    rate = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.1"))],
        help_text="Exchange rate against the local currency in two decimal places."
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='ercreator',
        related_query_name='ercreator'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    modified_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='ermodifier',
        related_query_name='ermodifier',
        blank=True,
        null=True
    )
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        cache_key = "local_currency"
        local_currency = cache.get(cache_key)
        if local_currency is None:
            local_currency = Currency.objects.filter(is_local=True).first()
            cache.set(cache_key, local_currency, timeout=3600)  # Cache for an hour

        local_currency_description = local_currency.description if local_currency else "N/A"
        return (
            f"Exchange rate for {self.currency.description} "
            f"against local currency: {local_currency_description} "
            f"on {self.created_at:%B %d, %Y at %I:%M %p} is {self.rate}"
        )

    def clean(self):
        """Ensure that the currency is not local."""
        if self.currency.is_local:
            raise ValidationError("Exchange rates cannot be assigned to a local currency.")
        # Round the rate to 2 decimal places
        if isinstance(self.rate, Decimal):
            self.rate = self.rate.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    def save(self, *args, **kwargs):
        """Ensure modified_by is set when updating a record and handle validation."""
        is_new = self._state.adding  # True if creating a new record

        if not is_new and not self.modified_by:
            raise ValidationError("modifier must be specified for updating a record.")

        try:
            with transaction.atomic():
                self.full_clean()  # Validate the model before saving
                super().save(*args, **kwargs)
        except IntegrityError as e:
            if "unique_currency_per_day" in str(e):
                raise ValidationError("Only one exchange rate per currency per day is allowed.")
            else:
                raise ValidationError(f"An error occurred while saving the exchange rate: {str(e)}")

    class Meta:
        indexes = [
            models.Index(fields=["currency"]),
            models.Index(fields=["rate"]),
        ]
        ordering = ["-created_at"]
        verbose_name = "Exchange Rate"
        verbose_name_plural = "Exchange Rates"
        constraints = [
        models.UniqueConstraint(
            fields=["currency"],
            name="unique_currency_per_day",
            condition=models.Q(created_at__date=TruncDate("created_at")),
        )
    ]