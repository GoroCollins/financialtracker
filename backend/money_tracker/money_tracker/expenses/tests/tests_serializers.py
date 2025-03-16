import pytest
from decimal import Decimal
from rest_framework.exceptions import ValidationError
from ..api.serializers import (
    FixedExpenseSerializer,
    VariableExpenseSerializer,
    DiscretionaryExpenseSerializer,
)

from money_tracker.expenses.tests.factories import (
    FixedExpenseFactory,
    VariableExpenseFactory,
    DiscretionaryExpenseFactory,
)
from money_tracker.currencies.tests.factories import CurrencyFactory
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestBaseExpenseSerializer:
    """Tests for the BaseExpenseSerializer."""

    def test_valid_serialization(self, fixed_expense):
        """Ensure a valid expense serializes correctly."""
        serializer = FixedExpenseSerializer(instance=fixed_expense)
        data = serializer.data

        assert data["id"] == fixed_expense.id
        assert data["expense_name"] == fixed_expense.expense_name
        assert data["currency"] == fixed_expense.currency.code
        assert data["amount"] == str(fixed_expense.amount)
        assert data["created_by"] == fixed_expense.created_by.username
        assert "modified_by" in data  # Can be null
        assert "amount_lcy_display" in data
        assert isinstance(data["amount_lcy_display"], str)  # Should be formatted as "{currency_code} {amount}"

    def test_create_valid_expense(self, user, local_currency, rf):
        """Ensure a valid expense can be created via the serializer."""
        request = rf.post("/")
        request.user = user

        data = {
            "expense_name": "Test Expense",
            "currency": local_currency.code,
            "amount": "150.00",
            "notes": "Test note",
        }
        serializer = FixedExpenseSerializer(data=data, context={"request": request})

        assert serializer.is_valid(), serializer.errors
        expense = serializer.save()

        assert expense.expense_name == data["expense_name"]
        assert expense.currency == local_currency
        assert expense.amount == Decimal(data["amount"])
        assert expense.created_by == user
        assert expense.modified_by is None  # Should be null on creation

    def test_update_sets_modified_by(self, fixed_expense, user, rf):
        """Ensure modifying an expense updates `modified_by`."""
        request = rf.patch("/")
        request.user = user

        serializer = FixedExpenseSerializer(
            instance=fixed_expense,
            data={"amount": "200.00"},
            partial=True,
            context={"request": request},
        )

        assert serializer.is_valid(), serializer.errors
        updated_expense = serializer.save()

        assert updated_expense.amount == Decimal("200.00")
        assert updated_expense.modified_by == user  # Must be updated

    def test_amount_must_be_non_negative(self, user, local_currency, rf):
        """Ensure validation prevents negative amounts."""
        request = rf.post("/")
        request.user = user

        data = {
            "expense_name": "Invalid Expense",
            "currency": local_currency.code,
            "amount": "-50.00",  # Invalid
        }
        serializer = FixedExpenseSerializer(data=data, context={"request": request})

        with pytest.raises(ValidationError, match="Ensure this value is greater than or equal to 0."):
            serializer.is_valid(raise_exception=True)

    def test_requires_authentication(self, local_currency, rf):
        """Ensure unauthenticated users cannot create an expense."""
        request = rf.post("/")
        request.user = None  # No authentication

        data = {
            "expense_name": "Test Expense",
            "currency": local_currency.code,
            "amount": "100.00",
        }
        serializer = FixedExpenseSerializer(data=data, context={"request": request})

        with pytest.raises(ValidationError, match="User must be authenticated."):
            serializer.is_valid(raise_exception=True)


@pytest.mark.django_db
class TestConcreteSerializers:
    """Ensure the concrete serializers inherit validation correctly."""

    def test_fixed_expense_serializer(self, fixed_expense):
        expense = fixed_expense
        serializer = FixedExpenseSerializer(instance=expense)
        assert serializer.data["expense_name"] == expense.expense_name

    def test_variable_expense_serializer(self, variable_expense):
        expense = variable_expense
        serializer = VariableExpenseSerializer(instance=expense)
        assert serializer.data["expense_name"] == expense.expense_name

    def test_discretionary_expense_serializer(self, discretionary_expense):
        expense = discretionary_expense
        serializer = DiscretionaryExpenseSerializer(instance=expense)
        assert serializer.data["expense_name"] == expense.expense_name
