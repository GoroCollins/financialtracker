import pytest
from decimal import Decimal, ROUND_HALF_UP
from django.core.exceptions import ValidationError
from ..models import EarnedIncome, PortfolioIncome, PassiveIncome
from .factories import EarnedIncomeFactory, PortfolioIncomeFactory, PassiveIncomeFactory, UserFactory
from money_tracker.currencies.tests.factories import CurrencyFactory
from unittest.mock import patch
from freezegun import freeze_time


@pytest.mark.django_db
@pytest.mark.parametrize("income_type", ["earned", "portfolio", "passive"])
def test_income_creation(income_type, income_factories, foreign_currency, user, exchange_rate):
    """Test that an income instance is created successfully."""
    income = income_factories[income_type](created_by=user, currency=exchange_rate.currency)
    
    assert income.income_name
    assert income.amount > 0
    assert income.currency
    assert income.created_by
    assert income.amount_lcy == Decimal(income.convert_to_lcy(income.amount, income.currency)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


@pytest.mark.django_db
def test_income_with_local_currency(local_currency, user, income_factories):
    """Test that amount_lcy equals amount when currency is local."""
    income = income_factories["earned"](currency=local_currency, amount=Decimal('1000.00'), created_by=user)
    assert income.amount_lcy == income.amount

@pytest.mark.django_db
def test_income_with_foreign_currency(user, income_factories, foreign_currency):
    """Test that amount_lcy is calculated correctly for foreign currencies."""
    with patch.object(EarnedIncome, "convert_to_lcy", return_value=Decimal('1200.00')) as mock_convert:
        income = income_factories["earned"](currency=foreign_currency, amount=Decimal('1000.00'), created_by=user)
        assert income.amount_lcy == Decimal('1200.00')
        mock_convert.assert_called_once_with(income.amount, income.currency)

@pytest.mark.django_db
def test_income_negative_amount(user, local_currency, income_factories):
    """Test that a ValidationError is raised when the amount is negative."""
    income = income_factories["earned"].build(amount=Decimal('-100.00'), currency=local_currency, created_by=user)
    with pytest.raises(ValidationError):
        income.full_clean() # Forces Django model validation


@freeze_time("2025-03-07 10:00:00")
@pytest.mark.django_db
def test_income_update(user, income):
    """Test modified_by and modified_at fields."""
    new_user =  user          
    income.income_name = "Updated Income"
    income.modified_by = new_user
    income.save()

    assert income.modified_by == new_user
    assert income.modified_at.isoformat() == "2025-03-07T10:00:00+00:00"

@pytest.mark.django_db
def test_income_update_without_modifier(user, income):
    """Test that a ValidationError is raised when updating without a modifier."""
    income.income_name = "Updated Income"
    income.modified_by = None
    with pytest.raises(ValidationError):
        income.save()











