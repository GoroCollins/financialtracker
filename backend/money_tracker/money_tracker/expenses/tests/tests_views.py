import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from ..models import FixedExpense, VariableExpense, DiscretionaryExpense
from ..api.serializers import FixedExpenseSerializer, VariableExpenseSerializer, DiscretionaryExpenseSerializer
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from ..models import FixedExpense
from decimal import Decimal

User = get_user_model()

@pytest.fixture
def api_client():
    """Fixture for DRF API client."""
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
class TestExpenseViewSets:
    """Tests for expense viewsets."""

    def test_unauthenticated_user_cannot_access_expenses(self, api_client):
        """Ensure unauthenticated users cannot access expenses."""
        url = reverse("api:expenses:fixedexpense-list")  # Change based on your view names
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_authenticated_user_sees_only_their_expenses(self, authenticated_api_client, fixed_expense):
        """Ensure users see only their own expenses."""
        url = reverse("api:expenses:fixedexpense-list")
        response = authenticated_api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]["id"] == fixed_expense.id
        assert len(response.data) == 1  # Ensure only the user's expenses are returned

    def test_create_expense_requires_authentication(self, api_client, authenticated_api_client, user, local_currency):
        """Ensure authentication is required to create an expense."""
        url = reverse("api:expenses:fixedexpense-list")
        data = {
            "expense_name": "Test Expense",
            "currency": local_currency.code,
            "amount": "50.00"
        }

        # Unauthenticated request
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # Authenticated request
        response = authenticated_api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert FixedExpense.objects.count() == 1

    def test_update_expense_sets_modified_by(self, authenticated_api_client, user, fixed_expense):
        """Ensure updating an expense sets modified_by."""
        url = reverse("api:expenses:fixedexpense-detail", args=[fixed_expense.id])
        data = {"expense_name": "Updated Expense"}

        response = authenticated_api_client.patch(url, data, format="json")
        fixed_expense.refresh_from_db()

        assert response.status_code == status.HTTP_200_OK
        assert fixed_expense.expense_name == "Updated Expense"
        assert fixed_expense.modified_by == user

    def test_delete_expense(self, authenticated_api_client, user, fixed_expense):
        """Ensure users can delete their own expenses."""
        url = reverse("api:expenses:fixedexpense-detail", args=[fixed_expense.id])

        response = authenticated_api_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not FixedExpense.objects.filter(id=fixed_expense.id).exists()
    
    def test_user_cannot_access_another_users_expenses(self, fixed_expense, another_user):
        """Ensure users cannot access another user's expense."""
        url = reverse("api:expenses:fixedexpense-detail", args=[fixed_expense.id])

        # Authenticate as another_user
        another_client = APIClient()
        another_client.force_authenticate(user=another_user)

        response = another_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestTotalExpensesAPIView:
    """Tests for total expenses API."""

    def test_unauthenticated_user_cannot_access_total_expenses(self, api_client):
        """Ensure unauthenticated users cannot access the total expenses API."""
        url = reverse("api:expenses:totalexpenses")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_authenticated_user_receives_correct_total(self, authenticated_api_client, fixed_expense, variable_expense, discretionary_expense):
        """Ensure authenticated users get the correct total expenses."""
        url = reverse("api:expenses:totalexpenses")

        response = authenticated_api_client.get(url)

        expected_total = sum(exp.amount for exp in [fixed_expense, variable_expense, discretionary_expense])
        assert response.status_code == status.HTTP_200_OK
        assert response.data["total_expenses"] == expected_total
        
    def test_user_cannot_access_total_expenses_of_another_user(self, another_user):
        """Ensure users cannot access the total expenses of another user."""
        url = reverse("api:expenses:totalexpenses")

        # Authenticate as another_user
        another_client = APIClient()
        another_client.force_authenticate(user=another_user)

        response = another_client.get(url)

        assert response.status_code == status.HTTP_200_OK 
        assert response.data["total_expenses"] == 0 