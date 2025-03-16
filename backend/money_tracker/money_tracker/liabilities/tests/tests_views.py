import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from ..models import Loan, InterestType
from django.utils import timezone
from django.db.models import Sum

@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestLoanViewSet:
    def test_unauthenticated_user_cannot_access_loans(self, api_client):
        """Ensure unauthenticated users cannot access loans."""
        url = reverse("api:liabilities:loan-list")  # Change based on your view names
        response = api_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        
    def test_authenticated_users_sees_only_their_loans(self, api_client, user, loan):
        """Test retrieving a list of loans."""
        api_client.force_authenticate(user=user)
        url = reverse("api:liabilities:loan-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]["source"] == loan.source
        assert len(response.data) == 1

    def test_create_loan_requires_authentication(self, api_client, user, currency, interest_type):
        """Test creating a loan."""
        url = reverse("api:liabilities:loan-list")
        data = {
            "source": "Bank X",
            "loan_date": timezone.localdate(),
            "currency": currency.code,
            "amount_taken": "5000.00",
            "reason": "Business",
            "interest_type": interest_type.code,
            "repayment_date": timezone.localdate() + timezone.timedelta(days=365),
            "interest_rate": "10.00",
            "compound_frequency": 1,
        }
        # Ensure no loans exist before the test
        assert Loan.objects.count() == 0
        # Unauthenticated request
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN
        
         # Authenticate user
        api_client.force_authenticate(user=user)
        
         # Authenticated request
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert Loan.objects.count() == 1
        assert Loan.objects.first().created_by == user

    def test_update_loan(self, api_client, user, loan):
        """Test updating a loan."""
        api_client.force_authenticate(user=user)
        url = reverse("api:liabilities:loan-detail", args=[loan.id])
        data = {"reason": "Updated Reason"}
        response = api_client.patch(url, data, format="json")
        assert response.status_code == status.HTTP_200_OK
        loan.refresh_from_db()
        assert loan.reason == "Updated Reason"
        assert loan.modified_by == user

    def test_delete_loan(self, api_client, user, loan):
        """Test deleting a loan."""
        api_client.force_authenticate(user=user)
        url = reverse("api:liabilities:loan-detail", args=[loan.id])
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Loan.objects.count() == 0
    
    def test_user_cannot_access_another_users_loans(self, loan, another_user):
        """Ensure users cannot access another user's loans."""
        url = reverse("api:liabilities:loan-detail", args=[loan.id])

        # Authenticate as another_user
        another_client = APIClient()
        another_client.force_authenticate(user=another_user)

        response = another_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        
@pytest.mark.django_db
class TestInterestTypeViewSet:
    def test_unauthenticated_user_cannot_access_loans(self, api_client):
        """Ensure unauthenticated users cannot access interest types."""
        url = reverse("api:liabilities:interesttype-list")  # Change based on your view names
        response = api_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        
    def test_authenticated_users_see_only_their_interest_types(self, api_client, user, interest_type):
        """Test retrieving a list of interest types."""
        api_client.force_authenticate(user=user)
        url = reverse("api:liabilities:interesttype-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]["code"] == interest_type.code
        assert len(response.data) == 1

    def test_create_interest_type_requires_authentication(self, api_client, user):
        """Test creating an interest type."""
        url = reverse("api:liabilities:interesttype-list")
        data = {"code": "SIMPLE", "description": "Simple Interest"}
        
        # Unauthenticated request
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN
        
        # Authenticate user
        api_client.force_authenticate(user=user)

        # Authenticated request
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert InterestType.objects.count() == 1
        assert InterestType.objects.first().created_by == user
        
    def test_update_interest_type(self, api_client, user, interest_type):
        """Test updating an interest type."""
        api_client.force_authenticate(user=user)
        url = reverse("api:liabilities:interesttype-detail", args=[interest_type.code])
        data = {"description": "Updated Description"}
        response = api_client.patch(url, data, format="json")
        assert response.status_code == status.HTTP_200_OK
        interest_type.refresh_from_db()
        assert interest_type.description == "Updated Description"
        assert interest_type.modified_by == user

    def test_delete_interest_type(self, api_client, user, interest_type):
        """Test deleting an interest type."""
        api_client.force_authenticate(user=user)
        url = reverse("api:liabilities:interesttype-detail", args=[interest_type.code])
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert InterestType.objects.count() == 0
        
    def test_user_cannot_access_another_users_interest_types(self, interest_type, another_user):
        """Ensure users cannot access another user's interest types."""
        url = reverse("api:liabilities:interesttype-detail", args=[interest_type.code])

        # Authenticate as another_user
        another_client = APIClient()
        another_client.force_authenticate(user=another_user)

        response = another_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestTotalLiabilitiesAPIView:
    def test_unauthenticated_user_cannot_access_total_expenses(self, api_client):
        """Ensure unauthenticated users cannot access the total expenses API."""
        url = reverse("api:liabilities:totalliabilities")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN
    def test_authenticated_user_can_access_total_liabilities(self, api_client, user, loan):
        """Test retrieving total liabilities."""
        api_client.force_authenticate(user=user)
        url = reverse("api:liabilities:totalliabilities")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        expected_total = Loan.objects.aggregate(total=Sum("amount_taken_lcy"))["total"] or 0
        assert response.data["total_liabilities"] == expected_total
    
    def test_user_cannot_access_total_expenses_of_another_user(self, another_user):
        """Ensure users cannot access the total liabilities of another user."""
        url = reverse("api:liabilities:totalliabilities")

        # Authenticate as another_user
        another_client = APIClient()
        another_client.force_authenticate(user=another_user)

        response = another_client.get(url)

        assert response.status_code == status.HTTP_200_OK 
        assert response.data["total_liabilities"] == 0


    

        
 