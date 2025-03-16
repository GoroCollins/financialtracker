import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from ..models import Currency, ExchangeRate
from decimal import Decimal


@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def authenticated_api_client(user):
    """
    Provides an authenticated APIClient instance for use in tests.
    """
    client = APIClient()
    client.force_authenticate(user=user)
    return client

@pytest.mark.django_db
def test_authenticated_user_can_access_currencies_list(api_client, foreign_currency, user):
    # Arrange: Create a local currency first to satisfy validation
    
    api_client.force_authenticate(user=user) # Login for session-based auth

    # Act: Fetch the list of currencies
    url = reverse("api:currencies:currency-list")
    response = api_client.get(url)

    # Assert: Ensure all currencies are returned
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 2

@pytest.mark.django_db
def test_unauthenticated_user_cannot_access_currencies_list(api_client, local_currency):
        """Ensure unauthenticated users cannot access currencies."""
        url = reverse("api:currencies:currency-list")  # Change based on your view names
        response = api_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        
@pytest.mark.django_db
def test_create_currency_requires_authentication(api_client, authenticated_api_client, user):
        """Ensure authentication is required to create an expense."""
        url = reverse("api:currencies:currency-list")
        data = {
            "code": "SSH",
            "description": "Sample Shilling",
            "is_local": True
        }

        # Unauthenticated request
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

        # Authenticated request
        response = authenticated_api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert Currency.objects.count() == 1
        
@pytest.mark.django_db
def test_update_currency_sets_modified_by(authenticated_api_client, user, local_currency):
        """Ensure updating a currency sets modified_by."""
        url = reverse("api:currencies:currency-detail", args=[local_currency.code])
        data = {"description": "Updated description"}

        response = authenticated_api_client.patch(url, data, format="json")
        local_currency.refresh_from_db()

        assert response.status_code == status.HTTP_200_OK
        assert local_currency.description == "Updated description"
        assert local_currency.modified_by == user
        
@pytest.mark.django_db        
def test_delete_currency(authenticated_api_client, local_currency):
        """Ensure users can delete their own currencies."""
        url = reverse("api:currencies:currency-detail", args=[local_currency.code])

        response = authenticated_api_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Currency.objects.filter(code=local_currency.code).exists()
        
@pytest.mark.django_db 
def test_user_cannot_access_another_users_currencies(local_currency, another_user):
        """Ensure users cannot access another user's currencies."""
        url = reverse("api:currencies:currency-detail", args=[local_currency.code])

        # Authenticate as another_user
        another_client = APIClient()
        another_client.force_authenticate(user=another_user)

        response = another_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND   
            
@pytest.mark.django_db
def test_authenticated_user_can_access_exchange_rates_list(api_client, exchange_rate, user):
    api_client.force_authenticate(user=user) # Login for session-based auth

    # Act: Fetch the list of exchange rates
    url = reverse("api:currencies:exchangerate-list") 
    response = api_client.get(url)

    # Assert: Ensure all exchange rates are returned
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1 # Only 2 exchange rates are being created 
       
@pytest.mark.django_db
def test_unauthenticated_user_cannot_access_exchange_rates_list(api_client):
        """Ensure unauthenticated users cannot access currencies."""
        url = reverse("api:currencies:exchangerate-list")  # Change based on your view names
        response = api_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        
@pytest.mark.django_db
def test_create_exchange_rate_requires_authentication(api_client, authenticated_api_client, foreign_currency):
        """Ensure authentication is required to create an exchange rate."""
        url = reverse("api:currencies:exchangerate-list")
        data = {
            "currency": foreign_currency.code,
            "rate": Decimal('123.45')
        }

        # Unauthenticated request
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

        # Authenticated request
        response = authenticated_api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert ExchangeRate.objects.count() == 1

@pytest.mark.django_db
def test_create_exchange_rate_with_local_currency(authenticated_api_client, local_currency):
    
    # Attempt to create an exchange rate for the local currency
    response = authenticated_api_client.post(
        "/api/currencies/exchangerates/",
        {"currency": local_currency.code, "rate": "1.50"},
        format="json",
    )
    # Assert that the response returns a 400 Bad Request
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Exchange rates cannot be assigned to a local currency." in response.data["currency"]

@pytest.mark.django_db
def test_update_exchange_rate_sets_modified_by(authenticated_api_client, user, exchange_rate):
        """Ensure updating a currency sets modified_by."""
        url = reverse("api:currencies:exchangerate-detail", args=[exchange_rate.id])
        data = {"rate": 123.78}

        response = authenticated_api_client.patch(url, data, format="json")
        exchange_rate.refresh_from_db()

        assert response.status_code == status.HTTP_200_OK
        assert exchange_rate.rate == Decimal('123.78')
        assert exchange_rate.modified_by == user

@pytest.mark.django_db        
def test_delete_exchange_rate(authenticated_api_client, exchange_rate):
        """Ensure users can delete their own currencies."""
        url = reverse("api:currencies:exchangerate-detail", args=[exchange_rate.id])

        response = authenticated_api_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not ExchangeRate.objects.filter(id=exchange_rate.id).exists()

@pytest.mark.django_db 
def test_user_cannot_access_another_users_exchange_rates(exchange_rate, another_user):
        """Ensure users cannot access another user's currencies."""
        url = reverse("api:currencies:exchangerate-detail", args=[exchange_rate.id])

        # Authenticate as another_user
        another_client = APIClient()
        another_client.force_authenticate(user=another_user)

        response = another_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND 


@pytest.mark.django_db
def test_unauthenticated_user_cannot_access_local_currency(api_client):
        """Ensure unauthenticated users cannot access the local currency API."""
        url = reverse("api:currencies:get-localcurrency")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

def test_authenticated_user_receives_correct_local_currency(authenticated_api_client, local_currency):
        """Ensure authenticated users get the correct local currency."""
        url = reverse("api:currencies:get-localcurrency")

        response = authenticated_api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["local_currency_code"]
        
def test_user_cannot_access_local_currency_of_another_user(another_user):
        """Ensure users cannot access the local currency of another user."""
        url = reverse("api:currencies:get-localcurrency")

        # Authenticate as another_user
        another_client = APIClient()
        another_client.force_authenticate(user=another_user)

        response = another_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["error"] == "No local currency found."

def test_get_local_currency_not_found(authenticated_api_client):

    # Act: Attempt to fetch the local currency when none exists
    url = reverse("api:currencies:get-localcurrency")
    response = authenticated_api_client.get(url)

    # Assert: Ensure a 404 error is returned with a custom error message
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data["error"] == "No local currency found."




    

        
