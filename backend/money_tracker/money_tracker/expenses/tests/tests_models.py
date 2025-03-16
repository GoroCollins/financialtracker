import pytest
from django.core.exceptions import ValidationError
from decimal import Decimal
from money_tracker.expenses.models import FixedExpense, VariableExpense, DiscretionaryExpense

@pytest.mark.django_db
def test_fixed_expense_creation(fixed_expense):
    """Test that a FixedExpense instance is created successfully."""
    assert FixedExpense.objects.count() == 1
    assert fixed_expense.expense_name is not None
    assert fixed_expense.amount > 0
    assert fixed_expense.created_by is not None

@pytest.mark.django_db
def test_variable_expense_creation(variable_expense):
    """Test that a VariableExpense instance is created successfully."""
    assert VariableExpense.objects.count() == 1
    assert variable_expense.expense_name is not None
    assert variable_expense.amount > 0
    assert variable_expense.created_by is not None

@pytest.mark.django_db
def test_discretionary_expense_creation(discretionary_expense):
    """Test that a DiscretionaryExpense instance is created successfully."""
    assert DiscretionaryExpense.objects.count() == 1
    assert discretionary_expense.expense_name is not None
    assert discretionary_expense.amount > 0
    assert discretionary_expense.created_by is not None

@pytest.mark.django_db
def test_modified_by_validation(fixed_expense, user):
    """Ensure 'modified_by' must be set when updating an expense."""
    fixed_expense.expense_name = "Updated Name"
    
    # Should raise an error if modified_by is not set
    with pytest.raises(ValidationError, match="The 'modified_by' field must be set when updating a record."):
        fixed_expense.save()

    # Now set modified_by and save successfully
    fixed_expense.modified_by = user
    fixed_expense.save()
    assert fixed_expense.modified_by == user

@pytest.mark.django_db
def test_amount_must_be_non_negative(fixed_expense):
    """Ensure validation prevents negative amounts."""
    fixed_expense.amount = Decimal("-10.00")
    
    with pytest.raises(ValidationError, match="Ensure this value is greater than or equal to 0."):
        fixed_expense.full_clean()
