import pytest
from .factories import UserFactory, FixedExpenseFactory, VariableExpenseFactory, DiscretionaryExpenseFactory

from money_tracker.currencies.tests.factories import CurrencyFactory

@pytest.fixture(autouse=True)
def reset_factory_sequences():
    """
    Reset factory sequences before each test to avoid unique constraint violations.
    """
    for factory in [UserFactory, FixedExpenseFactory, VariableExpenseFactory, DiscretionaryExpenseFactory]:
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
def fixed_expense(db, user, local_currency):
    """Fixture for creating a fixed expense linked to the test user."""
    return FixedExpenseFactory(created_by=user, currency=local_currency)

@pytest.fixture
def variable_expense(db, user, local_currency):
    """Fixture for creating a variable expense linked to the test user."""
    return VariableExpenseFactory(created_by=user, currency=local_currency)

@pytest.fixture
def discretionary_expense(db, user, local_currency):
    """Fixture for creating a discretionary expense linked to the test user."""
    return DiscretionaryExpenseFactory(created_by=user, currency=local_currency)

@pytest.fixture
def another_user(django_user_model):
    """Fixture to create another user for access control tests."""
    return django_user_model.objects.create_user(username="another_user", password="testpassword")