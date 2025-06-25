import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from decimal import Decimal
from ..models import LiquidAsset, Equity, InvestmentAccount, RetirementAccount

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

@pytest.mark.django_db
class TestLiquidAssetViewSet:
    def test_liquid_asset_list(self, authenticated_api_client, liquid_asset):
        """
        Test that the LiquidAssetViewSet list endpoint returns the expected data.
        """
        url = reverse('api:assets:liquidasset-list') 
        response = authenticated_api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1  
        assert response.data[0]["source"] == liquid_asset.source
        
    def test_create_liquid_asset(self, authenticated_api_client, local_currency):
        """Test creating a liquid asset"""
        url = reverse("api:assets:liquidasset-list")  # Adjust if necessary
        data = {"source": "Bank", "name":"test", "currency": local_currency.code, "amount": Decimal('1000'), "notes": "Test asset"}
        response = authenticated_api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert LiquidAsset.objects.count() == 1

    def test_update_liquid_asset(self, authenticated_api_client, liquid_asset):
        """Test updating a liquid asset"""
        url = reverse("api:assets:liquidasset-detail", args=[liquid_asset.id])
        data = {"amount": 5000}
        response = authenticated_api_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        liquid_asset.refresh_from_db()
        assert liquid_asset.amount == 5000

    def test_delete_liquid_asset(self, authenticated_api_client, liquid_asset):
        """Test deleting a liquid asset"""
        url = reverse("api:assets:liquidasset-detail", args=[liquid_asset.id])
        response = authenticated_api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert LiquidAsset.objects.count() == 0
    
    def test_unauthenticated_access(self, api_client):
        """
        Test that unauthenticated users cannot access protected endpoints.
        """
        url = reverse('api:assets:liquidasset-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_cannot_create_liquid_asset(self, api_client, local_currency):
        """
        Test that an unauthenticated user cannot create an income record.
        """
        url = reverse('api:assets:liquidasset-list')
        data = {"source": "Bank", "name":"test", "currency": local_currency.code, "amount": 1000, "notes": "Test asset"}
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert LiquidAsset.objects.count() == 0  # ✅ Ensure no record was created
        
    def test_cannot_update_other_users_liquid_asset(self, authenticated_api_client, another_user, liquid_asset):
        """
        Test that a user cannot update another user's liquid asset record.
        """
        liquid_asset.created_by = another_user
        liquid_asset.modified_by = another_user
        liquid_asset.save()

        url = reverse('api:assets:liquidasset-detail', args=[liquid_asset.id])
        data = {"source": "Hacked Asset"}
        response = authenticated_api_client.patch(url, data, format='json')

        print(response.status_code, response.data)  # Debug response

        assert response.status_code == status.HTTP_404_NOT_FOUND  # ✅ Expect not found
        liquid_asset.refresh_from_db()
        assert liquid_asset.source != "Hacked Asset"

@pytest.mark.django_db
class TestEquityViewSet:
    def test_equity_list(self, authenticated_api_client, equity):
        """
        Test that the EquityViewSet list endpoint returns the expected data.
        """
        url = reverse('api:assets:equity-list') 
        response = authenticated_api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1  
        assert response.data[0]["name"] == equity.name
        
    def test_create_equity(self, authenticated_api_client, local_currency):
        """Test creating an equity asset"""
        url = reverse("api:assets:equity-list")
        data = {"name": "Stock A", "ratio": Decimal('0.65'), "currency": local_currency.code, "amount": Decimal('2000'), "note": "Test Asset"}
        response = authenticated_api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Equity.objects.count() == 1

    def test_update_equity(self, authenticated_api_client, equity):
        """Test updating an equity asset"""
        url = reverse("api:assets:equity-detail", args=[equity.id])
        data = {"ratio": 0.5}
        response = authenticated_api_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        equity.refresh_from_db()
        assert equity.ratio == 0.5
    
    def test_delete_equity(self, authenticated_api_client, equity):
        """Test deleting an equity asset"""
        url = reverse("api:assets:equity-detail", args=[equity.id])
        response = authenticated_api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Equity.objects.count() == 0
    
    def test_unauthenticated_access(self, api_client):
        """
        Test that unauthenticated users cannot access protected endpoints.
        """
        url = reverse('api:assets:equity-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_unauthenticated_cannot_create_equity(self, api_client, local_currency):
        """
        Test that an unauthenticated user cannot create an income record.
        """
        url = reverse('api:assets:equity-list')
        data = {"name": "Stock A", "ratio": Decimal('0.65'), "currency": local_currency.code, "amount": Decimal('2000'), "note": "Test Asset"}
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert Equity.objects.count() == 0  # ✅ Ensure no record was created
    
    def test_cannot_update_other_users_equity(self, authenticated_api_client, another_user, equity):
        """
        Test that a user cannot update another user's liquid asset record.
        """
        equity.created_by = another_user
        equity.modified_by = another_user
        equity.save()

        url = reverse('api:assets:equity-detail', args=[equity.id])
        data = {"name": "Hacked Equity"}
        response = authenticated_api_client.patch(url, data, format='json')

        print(response.status_code, response.data)  # Debug response

        assert response.status_code == status.HTTP_404_NOT_FOUND  # ✅ Expect not found
        equity.refresh_from_db()
        assert equity.name != "Hacked Equity"

@pytest.mark.django_db
class TestInvestmentAccountViewSet:
    def test_investment_account_list(self, authenticated_api_client, investment_account):
        """
        Test that the InvestmentAccountViewSet list endpoint returns the expected data.
        """
        url = reverse('api:assets:investmentaccount-list') 
        response = authenticated_api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1  
        assert response.data[0]["name"] == investment_account.name
    
    def test_create_investment_account(self, authenticated_api_client, local_currency):
        """Test creating an investment account"""
        url = reverse("api:assets:investmentaccount-list")
        data = {"name": "401k", "currency": local_currency.code, "amount": 5000, "notes": "Test account"}
        response = authenticated_api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert InvestmentAccount.objects.count() == 1
    
    def test_update_investment_account(self, authenticated_api_client, investment_account):
        """Test updating an investment account asset"""
        url = reverse("api:assets:investmentaccount-detail", args=[investment_account.id])
        data = {"name": "SkyLim Investment"}
        response = authenticated_api_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        investment_account.refresh_from_db()
        assert investment_account.name == "SkyLim Investment"

    def test_delete_investment_account(self, authenticated_api_client, investment_account):
        """Test deleting an investment account"""
        url = reverse("api:assets:investmentaccount-detail", args=[investment_account.id])
        response = authenticated_api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert InvestmentAccount.objects.count() == 0
    
    def test_unauthenticated_access(self, api_client):
        """
        Test that unauthenticated users cannot access protected endpoints.
        """
        url = reverse('api:assets:investmentaccount-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_unauthenticated_cannot_create_investment_account(self, api_client, local_currency):
        """
        Test that an unauthenticated user cannot create an asset record.
        """
        url = reverse('api:assets:investmentaccount-list')
        data = {"name": "401k", "currency": local_currency.code, "amount": 5000, "notes": "Test account"}
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert InvestmentAccount.objects.count() == 0  # ✅ Ensure no record was created
    
    def test_cannot_update_other_users_investment_account(self, authenticated_api_client, another_user, investment_account):
        """
        Test that a user cannot update another user's liquid asset record.
        """
        investment_account.created_by = another_user 
        investment_account.modified_by = another_user
        investment_account.save()

        url = reverse('api:assets:investmentaccount-detail', args=[investment_account.id])
        data = {"name": "Hacked Asset"}
        response = authenticated_api_client.patch(url, data, format='json')

        print(response.status_code, response.data)  # Debug response

        assert response.status_code == status.HTTP_404_NOT_FOUND  # ✅ Expect not found
        investment_account.refresh_from_db()
        assert investment_account.name != "Hacked Asset"

@pytest.mark.django_db
class TestRetirementAccountViewSet:
    def test_retirement_account_list(self, authenticated_api_client, retirement_account):
        """
        Test that the RetirementAccountViewSet list endpoint returns the expected data.
        """
        url = reverse('api:assets:retirementaccount-list') 
        response = authenticated_api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1  
        assert response.data[0]["employer"] == retirement_account.employer
        
    def test_create_retirement_account(self, authenticated_api_client, local_currency):
        """Test creating a retirement account"""
        url = reverse("api:assets:retirementaccount-list")
        data = {"name": "Pension Plan", "currency": local_currency.code, "amount": 8000, "employer": "Company A", "notes": "Test account"}
        response = authenticated_api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert RetirementAccount.objects.count() == 1

    def test_update_retirement_account(self, authenticated_api_client, retirement_account):
        """Test updating a retirement account"""
        url = reverse("api:assets:retirementaccount-detail", args=[retirement_account.id])
        data = {"amount": 10000}
        response = authenticated_api_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        retirement_account.refresh_from_db()
        assert retirement_account.amount == 10000
    
    def test_delete_retirement_account(self, authenticated_api_client, retirement_account):
        """Test deleting a retirement account"""
        url = reverse("api:assets:retirementaccount-detail", args=[retirement_account.id])
        response = authenticated_api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert RetirementAccount.objects.count() == 0
    
    def test_unauthenticated_access(self, api_client):
        """
        Test that unauthenticated users cannot access protected endpoints.
        """
        url = reverse('api:assets:retirementaccount-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_unauthenticated_cannot_create_retirement_account(self, api_client, local_currency):
        """
        Test that an unauthenticated user cannot create an asset record.
        """
        url = reverse('api:assets:retirementaccount-list')
        data = {"name": "Pension Plan", "currency": local_currency.code, "amount": 8000, "employer": "Company A", "notes": "Test account"}
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert RetirementAccount.objects.count() == 0  # ✅ Ensure no record was created
    
    def test_cannot_update_other_users_retirement_account(self, authenticated_api_client, another_user, retirement_account):
        """
        Test that a user cannot update another user's liquid asset record.
        """
        retirement_account.created_by = another_user 
        retirement_account.modified_by = another_user
        retirement_account.save()

        url = reverse('api:assets:retirementaccount-detail', args=[retirement_account.id])
        data = {"name": "Hacked Asset"}
        response = authenticated_api_client.patch(url, data, format='json')

        print(response.status_code, response.data)  # Debug response

        assert response.status_code == status.HTTP_404_NOT_FOUND  # ✅ Expect not found
        retirement_account.refresh_from_db()
        assert retirement_account.name != "Hacked Asset"

@pytest.mark.django_db
class TestTotalAssetsAPIView:
    def test_authenticated_user_access_total_assets_api(self, authenticated_api_client, liquid_asset, equity, investment_account, retirement_account):
        """Test total assets calculation"""
        url = reverse("api:assets:totalassets")  # Adjust to your actual API URL
        response = authenticated_api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        expected_total = (
            liquid_asset.amount +
            equity.amount +
            investment_account.amount +
            retirement_account.amount
        )
        assert response.data["total_assets"] == expected_total
    
    def test_unauthenticated_user_cannot_access_total_assets(self, api_client):
        """Ensure unauthenticated users cannot access the total expenses API."""
        url = reverse("api:assets:totalassets")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
    def test_user_cannot_access_total_assets_of_another_user(self, another_user):
        """Ensure users cannot access the total expenses of another user."""
        url = reverse("api:expenses:totalexpenses")

        # Authenticate as another_user
        another_client = APIClient()
        another_client.force_authenticate(user=another_user)

        response = another_client.get(url)

        assert response.status_code == status.HTTP_200_OK 
        assert response.data["total_expenses"] == 0 