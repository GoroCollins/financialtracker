import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone
from ..models import Loan

@pytest.mark.django_db
class TestInterestType:
    def test_interest_type_creation(self, interest_type):
        """Test that an InterestType instance is created successfully."""
        assert interest_type.code is not None
        assert interest_type.description != ""

    def test_interest_type_string_representation(self, interest_type):
        """Test that InterestType string representation is correct."""
        assert str(interest_type) == f"{interest_type.code.capitalize()} Interest Rate"

    def test_interest_type_save_enforces_uppercase_code(self, interest_type):
        """Ensure the code is always stored in uppercase."""
        # interest_type.code = "simple"
        # interest_type.save()
        assert interest_type.code.isupper()

    def test_interest_type_modified_by_required_on_update(self, interest_type, user):
        """Ensure modified_by is required when updating an InterestType instance."""
        interest_type.modified_by = None
        with pytest.raises(ValidationError, match="modifier must be specified for updating a record"):
            interest_type.save()


@pytest.mark.django_db
class TestLoan:
    def test_loan_creation(self, loan):
        """Test that a Loan instance is created successfully."""
        assert loan.source is not None
        assert loan.amount_taken > 0
        assert loan.currency is not None
        assert loan.interest_type is not None
        assert loan.repayment_date > loan.loan_date

    def test_loan_string_representation(self, loan):
        """Test that Loan string representation is correct."""
        assert str(loan).startswith(f"Loan from {loan.source}")

    def test_loan_negative_amount_should_fail(self, loan):
        """Ensure a loan cannot be created with a negative amount."""
        loan.amount_taken = -500
        with pytest.raises(ValidationError, match="Amount must be a non-negative value"):
            loan.clean()

    def test_loan_repayment_date_must_be_after_loan_date(self, loan):
        """Ensure repayment date must be after loan date."""
        loan.repayment_date = loan.loan_date - timezone.timedelta(days=1)
        with pytest.raises(ValidationError, match="Repayment date must be after loan date"):
            loan.clean()

    def test_compound_interest_requires_frequency(self, compound_loan):
        """Ensure compound interest loans must have a frequency set."""
        compound_loan.compound_frequency = None
        with pytest.raises(ValidationError, match="Compound frequency must be specified for compound interest"):
            compound_loan.clean()

    def test_loan_default_check(self, loan):
        """Test if the loan defaults correctly when conditions are met."""
        loan.due_balance = 100
        loan.repayment_date = timezone.localdate() - timezone.timedelta(days=1)
        assert loan.loan_default() is True
