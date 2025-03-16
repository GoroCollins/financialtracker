import pytest
from django.core.exceptions import ValidationError

@pytest.mark.django_db
def test_create_liquid_asset(liquid_asset, user, local_currency):
    """Test that a LiquidAsset instance is created correctly."""
    assert liquid_asset.source is not None
    assert liquid_asset.currency == local_currency
    assert liquid_asset.amount >= 0
    assert liquid_asset.created_by == user
    assert liquid_asset.modified_by is None  # Should be None on creation

@pytest.mark.django_db
def test_create_equity(equity, user, local_currency):
    """Test that an Equity instance is created correctly."""
    assert equity.name is not None
    assert equity.currency == local_currency
    assert equity.amount >= 0
    assert 0.1 <= equity.ratio <= 1  # Ratio should be between 0.1 and 1
    assert equity.created_by == user
    assert equity.modified_by is None

@pytest.mark.django_db
def test_create_investment_account(investment_account, user, local_currency):
    """Test that an InvestmentAccount instance is created correctly."""
    assert investment_account.name is not None
    assert investment_account.currency == local_currency
    assert investment_account.amount >= 0
    assert investment_account.created_by == user
    assert investment_account.modified_by is None

@pytest.mark.django_db
def test_create_retirement_account(retirement_account, user, local_currency):
    """Test that a RetirementAccount instance is created correctly."""
    assert retirement_account.name is not None
    assert retirement_account.employer is not None
    assert retirement_account.currency == local_currency
    assert retirement_account.amount >= 0
    assert retirement_account.created_by == user
    assert retirement_account.modified_by is None

@pytest.mark.django_db
def test_update_modified_by(liquid_asset, user):
    """Test that modified_by is set correctly on update."""
    another_user = user  # You can use user factory to create a different user if needed
    liquid_asset.modified_by = another_user
    liquid_asset.save()
    assert liquid_asset.modified_by == another_user

@pytest.mark.django_db
def test_amount_cannot_be_negative(liquid_asset):
    """Test that amount cannot be negative."""
    liquid_asset.amount = -100
    with pytest.raises(ValidationError):
        liquid_asset.full_clean()  # Trigger model validation
