from django.db import models
from money_tracker.currencies.models import Currency
from django.conf import settings
from money_tracker.currencies.mixins import CurrencyConversionMixin
from django.core.exceptions import ValidationError
from django.db import transaction
from decimal import Decimal, ROUND_HALF_UP
from django.core.validators import MinValueValidator
import logging

User = settings.AUTH_USER_MODEL
logger = logging.getLogger(__name__)

class BaseExpense(models.Model, CurrencyConversionMixin):
    """Abstract base model for all expense types."""
    expense_name = models.CharField(max_length=100, null=False, blank=False)
    currency = models.ForeignKey(
        Currency, on_delete=models.PROTECT, related_name="%(class)s_currency"
    )
    amount = models.DecimalField(max_digits=20, decimal_places=2, validators=[MinValueValidator(Decimal('0'))])
    amount_lcy = models.DecimalField(max_digits=20, decimal_places=2, default=0.00, validators=[MinValueValidator(Decimal('0'))])
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="%(class)s_creator", null=False, blank=False
    )
    created_at = models.DateTimeField(auto_now_add=True)
    modified_by = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="%(class)s_modifier", null=True, blank=True
    )
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["id"]
        get_latest_by = "-created_at"

    def __str__(self) -> str:
        return f"{self.expense_name} costing {self.currency.code} {self.amount}"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        if not is_new and not self.modified_by:
            raise ValidationError("The 'modified_by' field must be set when updating a record.")

        try:
            with transaction.atomic():
                self.amount_lcy = Decimal(self.convert_to_lcy(self.amount, self.currency)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                self.full_clean()  # Validate before saving
                super().save(*args, **kwargs)
        except Exception as e:
            logger.exception("Error saving expense record: %s", str(e))
            raise ValidationError("An error occurred while saving the expense. Please check the data.")

# Concrete Expense Models
class FixedExpense(BaseExpense):
    """Expenses incurred periodically (e.g., rent, utilities)."""
    class Meta:
        verbose_name = "Fixed Expense"
        verbose_name_plural = "Fixed Expenses"

class VariableExpense(BaseExpense):
    """Expenses that vary with usage (e.g., electricity, shopping)."""
    class Meta:
        verbose_name = "Variable Expense"
        verbose_name_plural = "Variable Expenses"

class DiscretionaryExpense(BaseExpense):
    """Non-essential expenses (e.g., entertainment, travel)."""
    class Meta:
        verbose_name = "Discretionary Expense"
        verbose_name_plural = "Discretionary Expenses"
