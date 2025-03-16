# tests_models.py
import pytest
from ..models import Currency, ExchangeRate
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from decimal import Decimal

@pytest.mark.django_db
def test_create_local_currency(local_currency, user):
    """Test creating a local currency."""
    assert local_currency.is_local
    assert local_currency.created_by == user
    assert Currency.objects.count() == 1

@pytest.mark.django_db
def test_prevent_multiple_local_currencies(local_currency, user):
    """Ensure that only one local currency can exist."""
    with pytest.raises(ValidationError, match="Only one local currency is allowed."):
        Currency.objects.create(code="EUR", is_local=True, created_by=user)

@pytest.mark.django_db
def test_update_foreign_currency_to_local(foreign_currency, local_currency, user):
    """Ensure a foreign currency cannot be updated to local if one already exists."""
    foreign_currency.is_local = True
    foreign_currency.modified_by = user  # Required due to model constraints
    with pytest.raises(ValidationError, match="Only one local currency is allowed."):
        foreign_currency.save()

@pytest.mark.django_db
def test_prevent_foreign_currency_without_local(user):
    """Ensure that a foreign currency cannot be created without a local currency."""
    with pytest.raises(ValidationError, match="Cannot set this currency as foreign; no local currency exists."):
        Currency.objects.create(code="USD", is_local=False, created_by=user)

@pytest.mark.django_db
def test_unique_constraint_on_local_currency(local_currency, user):
    """Test that the database enforces the unique constraint on local currency."""
    with pytest.raises(ValidationError):
        Currency.objects.create(code="SSH", is_local=True, created_by=user)
        
@pytest.mark.django_db
def test_currency_str_representation(local_currency, user):
    """Test the __str__ method of the Currency model."""
    
    # Create the foreign currency to test the string representation
    currency = Currency.objects.create(description="United States Dollar", code="USD", is_local=False, created_by=user)
    assert str(currency) == "USD - United States Dollar"


@pytest.mark.django_db
def test_currency_indexes(local_currency):
    """Ensure indexes are correctly applied."""
    # assert Currency.objects.filter(code="USD").exists()
    assert Currency.objects.filter(is_local=True).exists()

@pytest.mark.django_db
def test_prevent_deleting_only_local_currency(local_currency, user):
    """Ensure that the only local currency cannot be deleted if foreign currencies exist."""
    Currency.objects.create(code="SSH", is_local=False, created_by=user, description="Sample Shilling")
    with pytest.raises(ValidationError, match="Cannot delete the only local currency."):
        local_currency.delete()

@pytest.mark.django_db
def test_only_one_local_currency_allowed(local_currency, user):
    """Ensure that only one local currency can exist in the database."""
    # Create another local currency

    # Attempt to create a second local currency
    with pytest.raises(ValidationError, match="Only one local currency is allowed."):
        Currency.objects.create(code="SSH", description="Sample Shilling", is_local=True, created_by=user)# Trigger validation

    # Verify that only one local currency exists in the database
    assert Currency.objects.filter(is_local=True).count() == 1
        
@pytest.mark.django_db
def test_create_exchange_rate(exchange_rate, foreign_currency):
    
    assert exchange_rate.currency == foreign_currency
    assert ExchangeRate.objects.count() == 1

@pytest.mark.django_db
def test_prevent_negative_exchange_rate(foreign_currency, user):
    with pytest.raises(ValidationError):
        ExchangeRate.objects.create(currency=foreign_currency, rate=-5.00, created_by=user)

@pytest.mark.django_db
def test_prevent_zero_exchange_rate(foreign_currency, user):
    with pytest.raises(ValidationError):
        ExchangeRate.objects.create(currency=foreign_currency, rate=0.00, created_by=user)

@pytest.mark.django_db
def test_local_currency_cannot_have_exchange_rate(local_currency, user):
    with pytest.raises(ValidationError):
        ExchangeRate.objects.create(currency=local_currency, rate=123.00, created_by=user) 

@pytest.mark.django_db
def test_exchange_rate_string_representation(user):
    # Create a local currency to satisfy the constraint
    local_currency = Currency.objects.create(is_local=True, description="Local Currency Description", code="SSH", created_by=user)
    
    # Create a foreign currency
    foreign_currency = Currency.objects.create(is_local=False, description="Foreign Currency Description", code="USD", created_by=user)
    
    # Create an exchange rate for the foreign currency
    exchange_rate = ExchangeRate.objects.create(currency=foreign_currency, rate=Decimal("1.50"), created_by=user)
    
    # Expected string representation
    expected_str = (
        f"Exchange rate for {foreign_currency.description} "
        f"against local currency: {local_currency.description} "
        f"on {exchange_rate.created_at:%B %d, %Y at %I:%M %p} is {exchange_rate.rate}"
    )
    
    # Assert that the string representation matches the expected value
    assert str(exchange_rate) == expected_str
    
@pytest.mark.django_db
def test_currency_code_validation(user):
    """Ensure that the currency code is uppercase and exactly 3 characters long."""
        # Case 1: Lowercase "usd" should fail
    currency1 = Currency(code="usd", description="Test", created_by=user)
    with pytest.raises(ValidationError, match="Currency code must be 3 uppercase letters."):
        currency1.full_clean()  # Ensures model validation runs
        # Case 2: Code longer than 3 characters "USD1" should fail
    currency2 = Currency(code="USD1", description="Test1", created_by=user)
    with pytest.raises(ValidationError, match="Currency code must be 3 uppercase letters."):
        currency2.full_clean()

@pytest.mark.django_db
def test_exchange_rate_decimal_precision(foreign_currency, user):
    """Ensure that the exchange rate respects the specified decimal precision."""
    
    # Create an exchange rate with a rate that has more than 2 decimal places
    exchange_rate = ExchangeRate.objects.create(currency=foreign_currency, rate=Decimal("1.23"), created_by=user)
    
    # Ensure the rate is rounded to 2 decimal places
    assert exchange_rate.rate == Decimal("1.23").quantize(Decimal("0.01"))
    
@pytest.mark.django_db
def test_exchange_rate_fewer_decimal_places(foreign_currency, user):
    """Ensure that the exchange rate handles values with fewer than 2 decimal places."""
    exchange_rate = ExchangeRate.objects.create(currency=foreign_currency, rate=Decimal("1.2"), created_by=user)
    assert exchange_rate.rate == Decimal("1.20")

@pytest.mark.django_db
def test_exchange_rate_modified_by_required(exchange_rate):
    """Ensure that modified_by is required when updating an exchange rate."""
    exchange_rate.rate = 1.30
    exchange_rate.modified_by = None
    with pytest.raises(ValidationError, match="modifier must be specified for updating a record."):
        exchange_rate.save()

@pytest.mark.django_db
def test_currency_modified_by_required(local_currency):
    """Ensure that modified_by is required when updating an exchange rate."""
    local_currency.description = "African Dollar"
    local_currency.modified_by = None
    with pytest.raises(ValidationError, match="modifier must be specified for updating a record."):
        local_currency.save()
        
@pytest.mark.django_db
def test_delete_currency(foreign_currency):
    """Test that a currency can be deleted."""
    
    # Delete the foreign currency
    foreign_currency.delete()
    
    # Verify that the foreign currency no longer exists
    assert Currency.objects.filter(code=foreign_currency.code).count() == 0
    
@pytest.mark.django_db
def test_delete_only_local_currency_with_foreign_currency(local_currency, user):
    """Test that the only local currency cannot be deleted if foreign currencies exist."""
    Currency.objects.create(is_local=False, code="USD", description="US Dollar", created_by=user)  # Create a foreign currency
    with pytest.raises(ValidationError) as excinfo:
        local_currency.delete()
    assert "Cannot delete the only local currency while foreign currencies exist." in str(excinfo.value)

@pytest.mark.django_db
def test_delete_only_local_currency_without_foreign_currency(local_currency):
    """Test that the only local currency can be deleted if no foreign currencies exist."""
    local_currency.delete()
    assert Currency.objects.filter(is_local=True).count() == 0

@pytest.mark.django_db
def test_delete_exchange_rate(exchange_rate):
    """Test that a currency can be deleted."""
    
    # Delete the foreign currency
    exchange_rate.delete()
    
    # Verify that the foreign currency no longer exists
    assert ExchangeRate.objects.filter(id=exchange_rate.id).count() == 0