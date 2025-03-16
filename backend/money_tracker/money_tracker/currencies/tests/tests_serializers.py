import pytest
from ..api.serializers import CurrencySerializer, ExchangeRateSerializer
from ..models import Currency, ExchangeRate
from rest_framework.exceptions import ValidationError
from django.utils.timezone import localtime
from decimal import Decimal

@pytest.mark.django_db
def test_currency_serializer_valid(local_currency):
    serializer = CurrencySerializer(local_currency)
    created_at = localtime(local_currency.created_at).isoformat()
    modified_at = localtime(local_currency.modified_at).isoformat()
    expected_data = {
        "code": local_currency.code,
        "description": local_currency.description,
        "is_local": local_currency.is_local,
        "created_by": local_currency.created_by.username if local_currency.created_by else None,  # Expected username
        "created_at": created_at,
        "modified_by": local_currency.modified_by.username if local_currency.modified_by else None,  # Assuming `modified_by` is not set
        "modified_at": modified_at,
    }
    assert serializer.data == expected_data

@pytest.mark.django_db
def test_currency_serializer_validation(local_currency):
    serializer = CurrencySerializer(data={"code": "EUR", "description": "Euro", "is_local": True})
    with pytest.raises(ValidationError) as excinfo:
        serializer.is_valid(raise_exception=True)
    assert "currency with this is local already exists." in str(excinfo.value)


@pytest.mark.django_db
def test_exchange_rate_serializer_valid(exchange_rate, foreign_currency):
    serializer = ExchangeRateSerializer(exchange_rate)
    # Normalize timestamps to the local timezone
    created_at = localtime(exchange_rate.created_at).isoformat()
    modified_at = localtime(exchange_rate.modified_at).isoformat()
    expected_data = {
        "id": exchange_rate.id,
        "currency": foreign_currency.code,  # Use primary key for currency
        "currency_description": foreign_currency.description,
        "currency_is_local": foreign_currency.is_local,  # Match the serializer's output
        "rate": str(exchange_rate.rate),
        "created_by": exchange_rate.created_by.username if exchange_rate.created_by else None,  # Expected username
        "created_at": created_at,
        "modified_by": exchange_rate.modified_by.username if exchange_rate.modified_by else None, 
        "modified_at": modified_at,
    }
    print(f"serializer.data: {serializer.data}")
    print(f"expected_data: {expected_data}")
    assert serializer.data == expected_data


@pytest.mark.django_db
def test_exchange_rate_serializer_local_currency(local_currency):

    # Attempt to create an exchange rate for the local currency
    serializer = ExchangeRateSerializer(data={"currency": local_currency.code, "rate": 1.25})
    with pytest.raises(ValidationError) as excinfo:
        serializer.is_valid(raise_exception=True)
    assert "Exchange rates cannot be assigned to a local currency." in str(excinfo.value)


@pytest.mark.django_db
def test_exchange_rate_serializer_rate_validation(foreign_currency):
    """Test that the exchange rate serializer validates the rate field."""
    serializer = ExchangeRateSerializer(data={"currency": foreign_currency.code, "rate": "0.05"})
    with pytest.raises(ValidationError) as excinfo:
        serializer.is_valid(raise_exception=True)
    assert "Rate must be at least 0.1." in str(excinfo.value)
    
@pytest.mark.django_db
def test_currency_serializer_foreign_currency_validation():
    """Test that the currency serializer validates foreign currency creation."""
    serializer = CurrencySerializer(data={"code": "USD", "description": "US Dollar", "is_local": False})
    with pytest.raises(ValidationError) as excinfo:
        serializer.is_valid(raise_exception=True)
    assert "Cannot set this currency as foreign; no local currency exists." in str(excinfo.value)
