import pytest
from .factories import CurrencyFactory, ExchangeRateFactory, UserFactory

# User fixtures
@pytest.fixture(autouse=True)
def reset_factory_sequences():
    """
    Reset factory sequences before each test to avoid unique constraint violations.
    """
    for factory in [UserFactory, CurrencyFactory, ExchangeRateFactory]:
        factory.reset_sequence()

@pytest.fixture
def local_currency(db, user):
    """Creates a local currency before any foreign currency is created."""
    return CurrencyFactory(is_local=True, created_by=user)

@pytest.fixture
def foreign_currency(db, local_currency, user):
    """Provides a foreign currency instance."""
    return CurrencyFactory.create(is_local=False, created_by=user)

# ExchangeRate fixtures
@pytest.fixture
def exchange_rate(foreign_currency, user):
    """Provides a single exchange rate instance for use in tests."""
    return ExchangeRateFactory(currency=foreign_currency, created_by=user, modified_by=user)

@pytest.fixture
def another_user(django_user_model):
    """Fixture to create another user for access control tests."""
    return django_user_model.objects.create_user(username="another_user", password="testpassword")
