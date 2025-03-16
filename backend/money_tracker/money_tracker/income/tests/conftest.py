import pytest 
from .factories import CurrencyFactory, UserFactory, EarnedIncomeFactory, PortfolioIncomeFactory, PassiveIncomeFactory
from money_tracker.currencies.tests.factories import CurrencyFactory
from money_tracker.currencies.models import ExchangeRate
from decimal import Decimal
from django.contrib.auth import get_user_model


@pytest.fixture(autouse=True)
def reset_factory_sequences():
    """
    Reset factory sequences before each test to avoid unique constraint violations.
    """
    for factory in [UserFactory, EarnedIncomeFactory, PortfolioIncomeFactory, PassiveIncomeFactory]:
        factory.reset_sequence()
@pytest.fixture
def local_currency(db):
    """Creates a local currency before any foreign currency is created."""
    return CurrencyFactory(is_local=True)
@pytest.fixture
def foreign_currency(db, local_currency):
    """Provides a foreign currency instance."""
    return CurrencyFactory.create(is_local=False)

@pytest.fixture
def exchange_rate(db, user, foreign_currency):
    return ExchangeRate.objects.create(
        currency=foreign_currency,
        rate=Decimal("110.50"),
        created_by=user,
    )
@pytest.fixture(params=[EarnedIncomeFactory, PortfolioIncomeFactory, PassiveIncomeFactory])
def income(request, user, foreign_currency, exchange_rate):  # Ensure exchange_rate is created first
    return request.param(created_by=user, currency=exchange_rate.currency)
@pytest.fixture
def income_factories():
    """
    Provides a dictionary of income factories for use in tests.
    """
    return {
        "earned": EarnedIncomeFactory,
        "portfolio": PortfolioIncomeFactory,
        "passive": PassiveIncomeFactory,
    }
    

@pytest.fixture
def earned_income(user, foreign_currency, exchange_rate):
    """Fixture for EarnedIncome instance"""
    return EarnedIncomeFactory(created_by=user, currency=exchange_rate.currency)

@pytest.fixture
def portfolio_income(user, foreign_currency, exchange_rate):
    """Fixture for PortfolioIncome instance"""
    return PortfolioIncomeFactory(created_by=user, currency=exchange_rate.currency)

@pytest.fixture
def passive_income(user, foreign_currency, exchange_rate):
    """Fixture for PassiveIncome instance"""
    return PassiveIncomeFactory(created_by=user, currency=exchange_rate.currency)

@pytest.fixture
def another_user(django_user_model):
    """Fixture to create another user for access control tests."""
    return django_user_model.objects.create_user(username="another_user", password="testpassword")

