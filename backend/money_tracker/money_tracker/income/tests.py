from backend.money_tracker.money_tracker.currencies.mixins import CurrencyConversionMixin
import pytest
from decimal import Decimal
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from datetime import date, timedelta
from money_tracker.liabilities.mixins import CurrencyConversionMixin, InterestCalculationMixin
from django.test import TestCase
from money_tracker.currencies.models import Currency, ExchangeRate
from django.contrib.auth import get_user_model

class CurrencyConversionMixinTest(TestCase):
    def setUp(self):
        # Create a test user
        self.user = get_user_model().objects.create_user(username="testuser", password="password")

        # Set up a test currency and exchange rate
        self.currency_local = Currency.objects.create(
            code="KSH", description="Kenyan Shilling", is_local=True, created_by=self.user
        )
        self.currency = Currency.objects.create(
            code="USD", description="US Dollar", is_local=False, created_by=self.user
        )

        self.mixin = CurrencyConversionMixin()
    
    def test_convert_to_lcy_with_local_currency(self):
        amount = Decimal("100.00")
        converted = self.mixin.convert_to_lcy(amount, self.currency_local)
        self.assertEqual(converted, amount)  # Should return same amount for local currency

    def test_conversion_valid_rate(self):
        # Create a valid exchange rate
        ExchangeRate.objects.create(currency=self.currency, rate=Decimal("1.2"), created_by=self.user)

        # Test the conversion with a valid rate
        result = self.mixin.convert_to_lcy(Decimal("100.00"), self.currency)
        self.assertEqual(result, Decimal("120.00"))

    def test_conversion_missing_rate(self):
        # Test conversion when no exchange rate exists
        new_currency = self.currency

        with self.assertRaises(ValidationError) as context:
            self.mixin.convert_to_lcy(Decimal("100.00"), new_currency)
        
        # Check the error message
        self.assertEqual(context.exception.message_dict["currency"][0], f"No exchange rate found for currency {new_currency}")