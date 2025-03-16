import pytest
from decimal import Decimal
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from ..models import EarnedIncome, PortfolioIncome, PassiveIncome

# Use the fixtures from conftest.py
pytestmark = pytest.mark.django_db  # Enable database access for all tests

@pytest.fixture
def api_client():
    """
    Provides an APIClient instance for use in tests.
    """
    return APIClient()

@pytest.fixture
def authenticated_api_client(user):
    """
    Provides an authenticated APIClient instance for use in tests.
    """
    client = APIClient()
    client.force_authenticate(user=user)
    return client
        
def test_authenticated_users_see_only_their_earned_income(authenticated_api_client, earned_income):
    """
    Test that the EarnedIncomeViewSet list endpoint returns the expected data.
    """
    url = reverse('api:income:earnedincome-list')  # Replace with your actual URL name
    response = authenticated_api_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1  # ✅ Ensures only EarnedIncome is fetched
    assert response.data[0]["income_name"] == earned_income.income_name

def test_portfolio_income_list(authenticated_api_client, portfolio_income):
    """
    Test that the PortfolioIncomeViewSet list endpoint returns the expected data.
    """
    url = reverse('api:income:portfolioincome-list')  # Replace with your actual URL name
    response = authenticated_api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["income_name"] == portfolio_income.income_name

def test_passive_income_list(authenticated_api_client, passive_income):
    """
    Test that the PassiveIncomeViewSet list endpoint returns the expected data.
    """
    url = reverse('api:income:passiveincome-list')  # Replace with your actual URL name
    response = authenticated_api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["income_name"] == passive_income.income_name

def test_create_earned_income_requires_authentication(authenticated_api_client, user, local_currency, api_client):
    """
    Test that the EarnedIncomeViewSet create endpoint creates a new record.
    """
    url = reverse('api:income:earnedincome-list')  # Replace with your actual URL name
    data = {
        "income_name": "Salary",
        "currency": local_currency.code,
        "amount": "1000.00",
        "notes": "Monthly salary",
    }
    # Unauthenticated request
    response = api_client.post(url, data, format="json")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    # Authenticated request
    response = authenticated_api_client.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert EarnedIncome.objects.count() == 1
    assert EarnedIncome.objects.first().created_by == user

def test_earned_income_update(authenticated_api_client, earned_income):
    """
    Test that the EarnedIncomeViewSet update endpoint updates a record.
    """
    url = reverse('api:income:earnedincome-detail', args=[earned_income.id])  
    data = {
        "income_name": "Updated Salary",
        "amount": "2000.00",
    }
    response = authenticated_api_client.patch(url, data, format='json') # ✅ Use PATCH for partial updates instead of PUT
    assert response.status_code == status.HTTP_200_OK
    earned_income.refresh_from_db()
    assert earned_income.income_name == "Updated Salary"
    assert earned_income.amount == Decimal('2000.00')
    assert earned_income.modified_by == earned_income.created_by
    assert earned_income.modified_by == authenticated_api_client.handler._force_user  # ✅ Ensure modifier is set

def test_cannot_update_other_users_income(authenticated_api_client, another_user, earned_income):
    """
    Test that a user cannot update another user's earned income record.
    """
    earned_income.created_by = another_user  # Assign income to another user
    earned_income.modified_by = another_user
    earned_income.save()

    url = reverse('api:income:earnedincome-detail', args=[earned_income.id])
    data = {"income_name": "Hacked Income"}
    response = authenticated_api_client.patch(url, data, format='json')

    print(response.status_code, response.data)  # Debug response

    assert response.status_code == status.HTTP_404_NOT_FOUND  # ✅ Expect not found
    earned_income.refresh_from_db()
    assert earned_income.income_name != "Hacked Income"

def test_earned_income_delete(authenticated_api_client, earned_income):
    """
    Test that the EarnedIncomeViewSet delete endpoint deletes a record.
    """
    url = reverse('api:income:earnedincome-detail', args=[earned_income.id])  # Replace with your actual URL name
    response = authenticated_api_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert EarnedIncome.objects.count() == 0


def test_unauthenticated_access(api_client):
    """
    Test that unauthenticated users cannot access protected endpoints.
    """
    url = reverse('api:income:earnedincome-list')  # Replace with your actual URL name
    response = api_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_unauthenticated_cannot_create_income(api_client, local_currency):
    """
    Test that an unauthenticated user cannot create an income record.
    """
    url = reverse('api:income:earnedincome-list')
    data = {
        "income_name": "Freelance Job",
        "currency": local_currency.code,
        "amount": "500.00",
        "notes": "One-time payment",
    }
    response = api_client.post(url, data, format='json')
    assert response.status_code == status.HTTP_403_FORBIDDEN  # ✅ Expect forbidden
    assert EarnedIncome.objects.count() == 0  # ✅ Ensure no record was created
    

def test_unauthenticated_user_cannot_access_total_income(api_client):
        """Ensure unauthenticated users cannot access the total expenses API."""
        url = reverse("api:income:totalincome")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN



def test_authenticated_user_receives_correct_total(authenticated_api_client, earned_income, portfolio_income, passive_income):
        """Ensure authenticated users get the correct total expenses."""
        url = reverse("api:income:totalincome")

        response = authenticated_api_client.get(url)

        expected_total = sum(exp.amount for exp in [earned_income, portfolio_income, passive_income])
        assert response.status_code == status.HTTP_200_OK
        assert response.data["total_income"] == expected_total
        
def test_user_cannot_access_total_income_of_another_user(another_user):
        """Ensure users cannot access the total expenses of another user."""
        url = reverse("api:income:totalincome")

        # Authenticate as another_user
        another_client = APIClient()
        another_client.force_authenticate(user=another_user)

        response = another_client.get(url)

        assert response.status_code == status.HTTP_200_OK 
        assert response.data["total_income"] == 0 


