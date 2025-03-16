import pytest
from rest_framework.exceptions import ValidationError
from ..api.serializers import (
    LiquidAssetSerializer,
    EquitySerializer,
    InvestmentAccountSerializer,
    RetirementAccountSerializer,
)
from decimal import Decimal
from rest_framework.test import APIRequestFactory
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model

User = get_user_model()

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

@pytest.mark.django_db
class TestLiquidAssetSerializer:
    def test_valid_liquid_asset_serialization(self, liquid_asset):
        """Test serialization of a valid LiquidAsset"""
        asset = liquid_asset
        serializer = LiquidAssetSerializer(instance=asset)
        data = serializer.data

        assert data["source"] == asset.source
        assert data["amount"] == str(asset.amount)  # DRF serializes Decimal as str
        assert data["currency"] == asset.currency.code
        assert data["created_by"] == asset.created_by.username
        assert "amount_lcy_display" in data

    def test_invalid_amount(self, user, local_currency):
        """Test validation error when amount is negative"""
        data = {
            "source": "Bank Deposit",
            "currency": local_currency.code,
            "amount": Decimal('-100.00'),  # Negative value should trigger validation error
            "created_by": user.id,
        }
        serializer = LiquidAssetSerializer(data=data)
        assert not serializer.is_valid()
        assert "amount" in serializer.errors
        print(f'Error: {serializer.errors['amount']}')
        assert serializer.errors["amount"][0] == "Ensure this value is greater than or equal to 0."

    def test_modified_by_remains_none_on_create(self, user, api_request, local_currency):
        """Ensure modified_by is NULL on initial creation"""
        request = api_request.post('/')
        request.user = user
        data = {"source": "Bank", "name": "test", "currency": local_currency.code, "amount": Decimal('500'), "notes": "New asset"}
        serializer = LiquidAssetSerializer(data=data, context={"request": request})
        assert serializer.is_valid(), serializer.errors
        instance = serializer.save()
        assert instance.modified_by is None  # Ensure it's not set on creation
    
    def test_modified_by_is_set_on_update(self, user, api_request, liquid_asset):
        """Test that modified_by is set on update"""
        request = api_request.post('/')
        request.user = user
        serializer = LiquidAssetSerializer(instance=liquid_asset, data={"amount": Decimal('2000')}, partial=True, context={"request": request})
        assert serializer.is_valid(), serializer.errors
        updated_instance = serializer.save()
        assert updated_instance.modified_by == request.user  # Ensure modified_by is set
        
    def test_created_by_is_set_on_create(self, user, api_request, local_currency):
        """Test that created_by is set when creating an object"""
        request = api_request.post('/')
        request.user = user
        data = {"source": "Bank", "name":"test", "currency": local_currency.code, "amount": Decimal('1000'), "notes": "Test asset"}
        serializer = LiquidAssetSerializer(data=data, context={"request": request})
        assert serializer.is_valid(), serializer.errors
        instance = serializer.save()
        assert instance.created_by == request.user
        assert instance.modified_by is None  # Should be NULL on creation

@pytest.mark.django_db
class TestEquitySerializer:

    def test_valid_equity_serialization(self, equity):
        """Test serialization of a valid Equity"""
        asset = equity
        serializer = EquitySerializer(instance=asset)
        data = serializer.data

        assert data["name"] == asset.name
        assert data["amount"] == str(asset.amount)
        assert data["currency"] == asset.currency.code
        assert data["created_by"] == asset.created_by.username
        assert "amount_lcy_display" in data

    def test_invalid_ratio(self, user, local_currency):
        """Test validation error when ratio is out of bounds"""
        data = {
            "name": "Tech Stocks",
            "currency": local_currency.code,
            "amount": Decimal('5000.00'),
            "ratio": Decimal('1.5'),  # Ratio should be between 0.1 and 1
            "created_by": user.id,
        }
        serializer = EquitySerializer(data=data)
        assert not serializer.is_valid()
        assert "ratio" in serializer.errors
    
    def test_modified_by_remains_none_on_create(self, user, api_request, local_currency):
        """Ensure modified_by is NULL on initial creation"""
        request = api_request.post('/')
        request.user = user
        data = {"ratio": Decimal('0.65'), "name": "test", "currency": local_currency.code, "amount": Decimal('500'), "notes": "New asset"}
        serializer = EquitySerializer(data=data, context={"request": request})
        assert serializer.is_valid(), serializer.errors
        instance = serializer.save()
        assert instance.modified_by is None  # Ensure it's not set on creation
    
    def test_modified_by_is_set_on_update(self, user, api_request, equity):
        """Test that modified_by is set on update"""
        request = api_request.post('/')
        request.user = user
        serializer = EquitySerializer(instance=equity, data={"amount": Decimal('2000')}, partial=True, context={"request": request})
        assert serializer.is_valid(), serializer.errors
        updated_instance = serializer.save()
        assert updated_instance.modified_by == request.user  # Ensure modified_by is set
        
    def test_created_by_is_set_on_create(self, user, api_request, local_currency):
        """Test that created_by is set when creating an object"""
        request = api_request.post('/')
        request.user = user
        data = {"ratio": Decimal('0.65'), "name":"test", "currency": local_currency.code, "amount": Decimal('1000'), "notes": "Test asset"}
        serializer = EquitySerializer(data=data, context={"request": request})
        assert serializer.is_valid(), serializer.errors
        instance = serializer.save()
        assert instance.created_by == request.user
        assert instance.modified_by is None  # Should be NULL on creation

@pytest.mark.django_db
class TestInvestmentAccountSerializer:

    def test_valid_investment_account_serialization(self, investment_account):
        """Test serialization of a valid InvestmentAccount"""
        asset = investment_account
        serializer = InvestmentAccountSerializer(instance=asset)
        data = serializer.data

        assert data["name"] == asset.name
        assert data["amount"] == str(asset.amount)
        assert data["currency"] == asset.currency.code
        assert data["created_by"] == asset.created_by.username
    
    def test_invalid_amount(self, user, local_currency):
        """Test validation error when amount is negative"""
        data = {
            "source": "Bank Deposit",
            "currency": local_currency.code,
            "amount": Decimal('-100.00'),  # Negative value should trigger validation error
            "created_by": user.id,
        }
        serializer = InvestmentAccountSerializer(data=data)
        assert not serializer.is_valid()
        assert "amount" in serializer.errors
        print(f'Error: {serializer.errors['amount']}')
        assert serializer.errors["amount"][0] == "Ensure this value is greater than or equal to 0."
    
    def test_modified_by_remains_none_on_create(self, user, api_request, local_currency):
        """Ensure modified_by is NULL on initial creation"""
        request = api_request.post('/')
        request.user = user
        data = {"name": "test", "currency": local_currency.code, "amount": Decimal('500'), "notes": "New asset"}
        serializer = InvestmentAccountSerializer(data=data, context={"request": request})
        assert serializer.is_valid(), serializer.errors
        instance = serializer.save()
        assert instance.modified_by is None  # Ensure it's not set on creation
    
    def test_modified_by_is_set_on_update(self, user, api_request, investment_account):
        """Test that modified_by is set on update"""
        request = api_request.post('/')
        request.user = user
        serializer = InvestmentAccountSerializer(instance=investment_account, data={"amount": Decimal('2000')}, partial=True, context={"request": request})
        assert serializer.is_valid(), serializer.errors
        updated_instance = serializer.save()
        assert updated_instance.modified_by == request.user  # Ensure modified_by is set
        
    def test_created_by_is_set_on_create(self, user, api_request, local_currency):
        """Test that created_by is set when creating an object"""
        request = api_request.post('/')
        request.user = user
        data = {"name":"test", "currency": local_currency.code, "amount": Decimal('1000'), "notes": "Test asset"}
        serializer = InvestmentAccountSerializer(data=data, context={"request": request})
        assert serializer.is_valid(), serializer.errors
        instance = serializer.save()
        assert instance.created_by == request.user
        assert instance.modified_by is None  # Should be NULL on creation

@pytest.mark.django_db
class TestRetirementAccountSerializer:

    def test_valid_retirement_account_serialization(self, retirement_account):
        """Test serialization of a valid RetirementAccount"""
        asset = retirement_account
        serializer = RetirementAccountSerializer(instance=asset)
        data = serializer.data

        assert data["name"] == asset.name
        assert data["employer"] == asset.employer
        assert data["amount"] == str(asset.amount)
        assert data["currency"] == asset.currency.code
        assert data["created_by"] == asset.created_by.username
    
    def test_invalid_amount(self, user, local_currency):
        """Test validation error when amount is negative"""
        data = {
            "source": "Bank Deposit",
            "currency": local_currency.code,
            "amount": Decimal('-100.00'),  # Negative value should trigger validation error
            "created_by": user.id,
        }
        serializer = RetirementAccountSerializer(data=data)
        assert not serializer.is_valid()
        assert "amount" in serializer.errors
        print(f'Error: {serializer.errors['amount']}')
        assert serializer.errors["amount"][0] == "Ensure this value is greater than or equal to 0."
        
    def test_modified_by_remains_none_on_create(self, user, api_request, local_currency):
        """Ensure modified_by is NULL on initial creation"""
        request = api_request.post('/')
        request.user = user
        data = {"employer": "SkyLim", "name": "test", "currency": local_currency.code, "amount": Decimal('500'), "notes": "New asset"}
        serializer = RetirementAccountSerializer(data=data, context={"request": request})
        assert serializer.is_valid(), serializer.errors
        instance = serializer.save()
        assert instance.modified_by is None  # Ensure it's not set on creation
    
    def test_modified_by_is_set_on_update(self, user, api_request, equity):
        """Test that modified_by is set on update"""
        request = api_request.post('/')
        request.user = user
        serializer = RetirementAccountSerializer(instance=equity, data={"amount": Decimal('2000')}, partial=True, context={"request": request})
        assert serializer.is_valid(), serializer.errors
        updated_instance = serializer.save()
        assert updated_instance.modified_by == request.user  # Ensure modified_by is set
        
    def test_created_by_is_set_on_create(self, user, api_request, local_currency):
        """Test that created_by is set when creating an object"""
        request = api_request.post('/')
        request.user = user
        data = {"employer": "SkyLim", "name":"test", "currency": local_currency.code, "amount": Decimal('1000'), "notes": "Test asset"}
        serializer = RetirementAccountSerializer(data=data, context={"request": request})
        assert serializer.is_valid(), serializer.errors
        instance = serializer.save()
        assert instance.created_by == request.user
        assert instance.modified_by is None  # Should be NULL on creation
