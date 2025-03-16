import pytest
from django.contrib.auth import get_user_model
from ..models import InterestType, Loan
from money_tracker.currencies.models import Currency
from .factories import UserFactory, InterestTypeFactory, CurrencyFactory, LoanFactory

User = get_user_model()


@pytest.fixture
def user():
    return UserFactory()


@pytest.fixture
def interest_type(user):
    return InterestTypeFactory(created_by=user)


@pytest.fixture
def compound_interest_type():
    return InterestTypeFactory(code="COMPOUND")


@pytest.fixture
def currency():
    return CurrencyFactory(is_local=True)


@pytest.fixture
def loan(user, interest_type, currency):
    return LoanFactory(created_by=user, interest_type=interest_type, currency=currency)


@pytest.fixture
def compound_loan(user, compound_interest_type, currency):
    return LoanFactory(created_by=user, interest_type=compound_interest_type, currency=currency, compound_frequency=12)

@pytest.fixture
def another_user(django_user_model):
    """Fixture to create another user for access control tests."""
    return django_user_model.objects.create_user(username="another_user", password="testpassword")
