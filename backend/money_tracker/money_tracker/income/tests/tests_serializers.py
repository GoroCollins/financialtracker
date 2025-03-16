import pytest
from decimal import Decimal
from django.core.exceptions import ValidationError
from rest_framework.test import APIRequestFactory
from ..api.serializers import EarnedIncomeSerializer, PortfolioIncomeSerializer, PassiveIncomeSerializer
from django.contrib.auth.models import AnonymousUser
from django.utils.timezone import localtime

# Use the fixtures from conftest.py
pytestmark = pytest.mark.django_db  # Enable database access for all tests

@pytest.fixture
def api_request():
    """Provides an APIRequestFactory instance for use in tests."""
    return APIRequestFactory()

@pytest.fixture
def unauthenticated_request(api_request):
    """Provides a request without authentication."""
    request = api_request.post('/')
    request.user = AnonymousUser()  # Ensures request is treated as unauthenticated
    return request

def test_earned_income_serializer_create(user, local_currency, api_request):
    """Test that EarnedIncomeSerializer creates an instance correctly."""
    request = api_request.post('/')
    request.user = user
    data = {
        "income_name": "Salary",
        "currency": local_currency.code,
        "amount": Decimal("1000.00"),
        "notes": "Monthly salary",
    }
    serializer = EarnedIncomeSerializer(data=data, context={"request": request})
    assert serializer.is_valid(), serializer.errors
    income = serializer.save()
    assert income.income_name == "Salary"
    assert income.amount == Decimal('1000.00')
    assert income.currency == local_currency
    assert income.created_by == user
    assert income.modified_by is None
 
def test_earned_income_serializer_create_fails_without_authentication(local_currency, unauthenticated_request):
    """Test that creation fails when user is not authenticated."""
    data = {
        "income_name": "Salary",
        "currency": local_currency.code,
        "amount": Decimal("1000.00"),
        "notes": "Monthly salary",
    }
    serializer = EarnedIncomeSerializer(data=data, context={"request": unauthenticated_request})
    assert not serializer.is_valid()
    assert "created_by" in serializer.errors
 
def test_earned_income_serializer_amount_zero(user, local_currency, api_request):
    """Test that EarnedIncomeSerializer allows an amount of zero."""
    request = api_request.post('/')
    request.user = user
    data = {
        "income_name": "Salary",
        "currency": local_currency.code,
        "amount": Decimal("0.00"),
    }
    serializer = EarnedIncomeSerializer(data=data, context={"request": request})
    assert serializer.is_valid(), serializer.errors

def test_earned_income_serializer_missing_currency(user, api_request):
    """Test that EarnedIncomeSerializer raises a ValidationError when currency is missing."""
    request = api_request.post('/')
    request.user = user
    data = {
        "income_name": "Salary",
        "amount": Decimal("1000.00"),
    }
    serializer = EarnedIncomeSerializer(data=data, context={"request": request})
    assert not serializer.is_valid()
    assert "currency" in serializer.errors

def test_earned_income_serializer_modified_by_initially_null(income):
    """Test that modified_by is initially None."""
    serializer = EarnedIncomeSerializer(income)
    assert serializer.data["modified_by"] is None

def test_earned_income_serializer_created_at_format(income):
    """Test that created_at is formatted correctly."""
    serializer = EarnedIncomeSerializer(income)
    expected_format = localtime(income.created_at).strftime("%b %d, %Y %I:%M %p")
    assert serializer.data["created_at"] == expected_format

def test_earned_income_serializer_modified_at_format(income):
    """Test that modified_at is formatted correctly."""
    serializer = EarnedIncomeSerializer(income)
    expected_format = localtime(income.modified_at).strftime("%b %d, %Y %I:%M %p")
    assert serializer.data["modified_at"] == expected_format 

def test_earned_income_serializer_update(user, income, api_request):
    """Test that EarnedIncomeSerializer updates an instance correctly."""
    request = api_request.put('/')
    request.user = user
    data = {
        "income_name": "Updated Salary",
        "amount": Decimal("2000.00"),
    }
    serializer = EarnedIncomeSerializer(instance=income, data=data, context={"request": request}, partial=True)
    assert serializer.is_valid(), serializer.errors
    income = serializer.save()
    assert income.income_name == "Updated Salary"
    assert income.amount == Decimal('2000.00')
    assert income.modified_by == user

def test_earned_income_serializer_update_fails_without_authentication(income, unauthenticated_request):
    """Test that updating fails when user is not authenticated."""
    data = {
        "income_name": "Updated Salary",
        "amount": Decimal("2000.00"),
    }
    serializer = EarnedIncomeSerializer(instance=income, data=data, context={"request": unauthenticated_request}, partial=True)
    assert not serializer.is_valid()
    assert "modified_by" in serializer.errors

def test_earned_income_serializer_negative_amount(user, local_currency, api_request):
    """Test that EarnedIncomeSerializer raises a ValidationError for negative amounts."""
    request = api_request.post('/')
    request.user = user
    data = {
        "income_name": "Salary",
        "currency": local_currency.code,
        "amount": Decimal("-100.00"),
    }
    serializer = EarnedIncomeSerializer(data=data, context={"request": request})
    assert not serializer.is_valid()
    assert "amount" in serializer.errors
    
def test_earned_income_serializer_update_without_modifier(user, income, api_request):
    """
    Test that the EarnedIncomeSerializer raises a ValidationError when updating without a modifier.
    """
    request = api_request.put('/')
    request.user = AnonymousUser()
    data = {
        "income_name": "Updated Salary",
        "amount": "2000.00",
        "modified_by": AnonymousUser(),  # Explicitly set to None
    }
    serializer = EarnedIncomeSerializer(instance=income, data=data, context={"request": request}, partial=True)
    assert serializer.is_valid() is False
    assert "modified_by" in serializer.errors







    


