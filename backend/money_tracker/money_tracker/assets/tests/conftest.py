import pytest
from rest_framework.test import APIRequestFactory
from .factories import (
    UserFactory, LiquidAssetFactory, EquityFactory, 
    InvestmentAccountFactory, RetirementAccountFactory
)
from money_tracker.currencies.tests.factories import CurrencyFactory

@pytest.fixture(autouse=True)
def reset_factory_sequences():
    """
    Reset factory sequences before each test to avoid unique constraint violations.
    """
    for factory in [UserFactory, LiquidAssetFactory, EquityFactory, InvestmentAccountFactory, RetirementAccountFactory]:
        factory.reset_sequence()
@pytest.fixture
def api_request_factory():
    return APIRequestFactory()

@pytest.fixture
def local_currency(db):
    """Creates a local currency before any foreign currency is created."""
    return CurrencyFactory(is_local=True)
@pytest.fixture
def foreign_currency(db, local_currency):
    """Provides a foreign currency instance."""
    return CurrencyFactory.create(is_local=False)

@pytest.fixture
def liquid_asset(db, user, local_currency):
    """Creates and returns a LiquidAsset instance."""
    return LiquidAssetFactory(created_by=user, currency=local_currency)

@pytest.fixture
def equity(db, user, local_currency):
    """Creates and returns an Equity instance."""
    return EquityFactory(created_by=user, currency=local_currency)

@pytest.fixture
def investment_account(db, user, local_currency):
    """Creates and returns an InvestmentAccount instance."""
    return InvestmentAccountFactory(created_by=user, currency=local_currency)

@pytest.fixture
def retirement_account(db, user, local_currency):
    """Creates and returns a RetirementAccount instance."""
    return RetirementAccountFactory(created_by=user, currency=local_currency)

@pytest.fixture
def another_user(django_user_model):
    """Fixture to create another user for access control tests."""
    return django_user_model.objects.create_user(username="another_user", password="testpassword")