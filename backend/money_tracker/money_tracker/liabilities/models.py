from django.db import models
from money_tracker.currencies.models import Currency
from .mixins import CurrencyConversionMixin, InterestCalculationMixin
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from decimal import Decimal, ROUND_DOWN, ROUND_HALF_UP
import logging
from django.conf import settings
User = settings.AUTH_USER_MODEL
logger = logging.getLogger(__name__)
# Create your models here.

class InterestType(models.Model):
    code = models.CharField(max_length=10, primary_key=True)
    description = models.CharField(max_length=150, null=False, blank=False)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='itcreator', related_query_name='itcreator', blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='itmodifier', related_query_name='itmodifier', blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.code.capitalize()} Interest Rate"

    def save(self, *args, **kwargs):
        self.code = self.code.upper()  # Ensure uppercase
        is_new = self._state.adding

        if not is_new and not self.modified_by:
            raise ValidationError("modifier must be specified for updating a record.")

        try:
            with transaction.atomic():
                self.full_clean()  # Validate before saving
                super().save(*args, **kwargs)
        except Exception as e:
            logger.exception(f"An error occurred while saving the interest type entry at {timezone.now()}: {str(e)}")
            raise ValidationError("An error occurred while saving the interest type. Please check the data.")
    class Meta:
        verbose_name = "Interest Type"
        verbose_name_plural = "Interest Types"

class Loan(models.Model, CurrencyConversionMixin, InterestCalculationMixin):
    source = models.CharField(max_length=100, null=False, blank=False)
    loan_date = models.DateField(null=False, blank=False)
    currency = models.ForeignKey(Currency, on_delete=models.PROTECT, null=False, blank=False, related_name='lcurrency', related_query_name='lcurrency')
    amount_taken = models.DecimalField(max_digits=20, decimal_places=2)
    amount_taken_lcy = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    reason = models.TextField(null=False, blank=False)
    interest_type = models.ForeignKey(InterestType, on_delete=models.PROTECT, null=False, blank=False, related_name='linterest', related_query_name='linterest')
    compound_frequency = models.IntegerField(null=True, blank=True)
    repayment_date = models.DateField(null=False, blank=False)
    interest_rate = models.DecimalField(max_digits=4, decimal_places=2, default=12.50, help_text="Annual interest rate in percentage.")
    interest = models.DecimalField(max_digits=20, decimal_places=2, default=0.00, editable=False)
    interest_lcy = models.DecimalField(max_digits=20, decimal_places=2, default=0.00, editable=False)
    in_default = models.BooleanField(default=False)
    amount_repay = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    amount_repay_lcy = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    amount_paid = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    amount_paid_lcy = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    due_balance = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    due_balance_lcy = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='lcreator', related_query_name='lcreator', blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='lmodifier', related_query_name='lmodifier', blank=True, null=True)
    modified_at = models.DateTimeField(auto_now=True)
    
    def __str__(self) -> str:
        return f"Loan from {self.source} for {self.reason} of amount {self.currency} {self.amount_taken} due on {self.created_at:%B %Y}"
    
    def clean(self):
        super().clean()

        # Validate amount
        if self.amount_taken < 0:
            raise ValidationError({"amount_taken": "Amount must be a non-negative value."})
        if self.interest_type.code == "COMPOUND" and self.compound_frequency is None:
            raise ValidationError({"compound_frequency": "Compound frequency must be specified for compound interest."})
        if self.repayment_date < self.loan_date:
            raise ValidationError({"repayment_date": "Repayment date must be after loan date."})
    
    def save(self, *args, **kwargs):
        is_new = self._state.adding

        if not is_new and not self.modified_by:
            raise ValidationError("modifier must be specified for updating a record.")

        try:
            with transaction.atomic():
                # Convert amount to local currency
                self.amount_taken_lcy = Decimal(self.convert_to_lcy(self.amount_taken, self.currency)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

                # Calculate interest based on type
                if self.interest_type.code == "COMPOUND":
                    self.interest = self.calculate_compound_interest(
                        self.amount_taken, self.interest_rate, self.loan_date, self.repayment_date, self.compound_frequency
                    )
                else:
                    self.interest = self.calculate_simple_interest(
                        self.amount_taken, self.interest_rate, self.loan_date, self.repayment_date
                    )

                # Round calculated values to ensure they fit max_digits=20 and decimal_places=2
                self.interest = Decimal(self.interest).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                self.interest_lcy = Decimal(self.convert_to_lcy(self.interest, self.currency)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

                # Ensure total repayment amount is rounded properly
                self.amount_repay = Decimal(self.amount_taken + self.interest).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                self.amount_repay_lcy = Decimal(self.convert_to_lcy(self.amount_repay, self.currency)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

                self.amount_paid_lcy = Decimal(self.convert_to_lcy(self.amount_paid, self.currency)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                self.due_balance_lcy = Decimal(self.convert_to_lcy(self.due_balance, self.currency)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

                self.full_clean()
                super().save(*args, **kwargs)

        except Exception as e:
            logger.exception(f"Error saving loan entry at {timezone.now()}: {str(e)}")
            raise ValidationError(f"Error saving loan: {str(e)}")
    
    
    class Meta:
        ordering = ['id']
        get_latest_by = "created_at"
        
    def loan_default(self):
        """Check if the loan is in default based on the due balance and repayment date."""
        return self.due_balance > 0 and self.repayment_date <= timezone.localdate() and not self.in_default

