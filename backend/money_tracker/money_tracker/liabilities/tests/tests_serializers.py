import pytest
from django.core.exceptions import ValidationError
from ..api.serializers import InterestTypeSerializer, LoanSerializer
from ..models import InterestType, Loan
from django.utils import timezone
from rest_framework.test import APIRequestFactory


@pytest.mark.django_db
class TestInterestTypeSerializer:
    def test_interest_type_serializer_valid_data(self, user):
        """Test InterestTypeSerializer with valid data."""
        data = {
            "code": "SIMPLE",
            "description": "Simple Interest",
            #"created_by": user.id
        }
        serializer = InterestTypeSerializer(data=data, context={"request": None})
        assert serializer.is_valid(raise_exception=True)
        # Manually set created_by
        instance = serializer.save(created_by=user)
        # assert serializer.is_valid(), serializer.errors
        # instance = serializer.save()
        assert instance.code == "SIMPLE"

    def test_interest_type_serializer_invalid_code(self, user):
        """Test InterestTypeSerializer fails if code is too long."""
        data = {
            "code": "TOO_LONG_CODE",
            "description": "Invalid Code Test",
        }
        serializer = InterestTypeSerializer(data=data, context={"request": None})
        assert not serializer.is_valid()
        assert "code" in serializer.errors

@pytest.mark.django_db
class TestLoanSerializer:
    def test_loan_serializer_valid_data(self, user, currency, interest_type):
        """Test LoanSerializer with valid data."""
        factory = APIRequestFactory()
        request = factory.post("/loans/", {})
        request.user = user  # ✅ Set an authenticated user
        data = {
            "source": "Bank X",
            "loan_date": timezone.localdate(),
            "currency": currency.code,
            "amount_taken": "10000.00",
            "reason": "Business Expansion",
            "interest_type": interest_type.code,
            "repayment_date": timezone.localdate() + timezone.timedelta(days=365),
            "interest_rate": "12.50",
            "compound_frequency": 1,
        }
        #serializer = LoanSerializer(data=data, context={"request": None})
        serializer = LoanSerializer(data=data, context={"request": request})  # ✅ Pass request
        assert serializer.is_valid(raise_exception=True)
        instance = serializer.save(created_by=user)
        assert instance.amount_taken == 10000.00
        assert instance.interest_rate == 12.50

    def test_loan_serializer_negative_amount(self, user, currency, interest_type):
        """Ensure serializer validation fails for negative loan amount."""
        factory = APIRequestFactory()
        request = factory.post("/loans/", {})
        request.user = user  # ✅ Set an authenticated user
        data = {
            "source": "Bank X",
            "loan_date": timezone.localdate(),
            "currency": currency.code,
            "amount_taken": "-500.00",
            "reason": "Business Expansion",
            "interest_type": interest_type.code,
            "repayment_date": timezone.localdate() + timezone.timedelta(days=365),
            "interest_rate": "12.50",
        }
        serializer = LoanSerializer(data=data, context={"request": request})
        assert not serializer.is_valid()  # ✅ Expect serializer to be invalid
        assert "amount_taken" in serializer.errors  # ✅ Now the error should be attached to this field
        assert serializer.errors["amount_taken"][0] == "Loan amount must be non-negative."
        # assert "non_field_errors" in serializer.errors  # ✅ Ensure the field has errors
        # assert any(
        #     "Loan amount must be non-negative." in error
        #     for error in serializer.errors["non_field_errors"]
        # ), "Expected validation error message not found."

    def test_loan_serializer_repayment_date_before_loan_date(self, user, currency, interest_type):
        """Ensure serializer validation fails if repayment date is before loan date."""
        factory = APIRequestFactory()
        request = factory.post("/loans/", {})
        request.user = user  # ✅ Set an authenticated user
        data = {
            "source": "Bank X",
            "loan_date": timezone.localdate(),
            "currency": currency.code,
            "amount_taken": "1000.00",
            "reason": "Emergency",
            "interest_type": interest_type.code,
            "repayment_date": timezone.localdate() - timezone.timedelta(days=1),
            "interest_rate": "10.00",
        }
        serializer = LoanSerializer(data=data, context={"request": request})  # ✅ Pass request
        assert not serializer.is_valid()  # ✅ Expect serializer to be invalid
        assert "repayment_date" in serializer.errors  # ✅ Check repayment_date has validation errors
        assert serializer.errors["repayment_date"][0] == "Repayment date cannot be before loan date."

    def test_loan_serializer_compound_interest_requires_frequency(self, user, currency, compound_interest_type):
        """Ensure serializer fails if compound interest type is missing compound_frequency."""
        factory = APIRequestFactory()
        request = factory.post("/loans/", {})
        request.user = user  # ✅ Set an authenticated user
        data = {
            "source": "Bank X",
            "loan_date": timezone.localdate(),
            "currency": currency.code,
            "amount_taken": "5000.00",
            "reason": "Investment",
            "interest_type": compound_interest_type.code,
            "repayment_date": timezone.localdate() + timezone.timedelta(days=365),
            "interest_rate": "12.50",
        }
        serializer = LoanSerializer(data=data, context={"request": request})  # ✅ Pass request
        assert not serializer.is_valid()
        assert "compound_frequency" in serializer.errors  # ✅ Ensure compound_frequency has validation errors
        assert serializer.errors["compound_frequency"][0] == "Compound frequency is required for compound interest."
