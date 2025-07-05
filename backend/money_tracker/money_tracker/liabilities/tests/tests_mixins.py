import pytest
from decimal import Decimal
from datetime import date, timedelta
from money_tracker.liabilities.mixins import InterestCalculationMixin


@pytest.mark.parametrize(
    "amount, rate, expected_interest",
    [
        (Decimal("1000.00"), Decimal("10.00"), Decimal("100.00")),  # 10% per year
        (Decimal("500.00"), Decimal("5.00"), Decimal("25.00")),    # 5% per year
    ],
)
def test_calculate_simple_interest(amount, rate, expected_interest):
    mixin = InterestCalculationMixin()
    start_date = date.today()
    end_date = start_date + timedelta(days=365)
    interest = mixin.calculate_simple_interest(amount, rate, start_date, end_date)
    assert interest == expected_interest

@pytest.mark.parametrize(
    "amount, rate, frequency, expected_interest",
    [
        (Decimal("1000.00"), Decimal("10.00"), 12, Decimal("104.71")),  # Monthly compounding
        (Decimal("500.00"), Decimal("5.00"), 4, Decimal("25.47")),     # Corrected quarterly compounding
    ],
)
def test_calculate_compound_interest(amount, rate, frequency, expected_interest):
    mixin = InterestCalculationMixin()
    start_date = date.today()
    end_date = start_date + timedelta(days=365)
    interest = mixin.calculate_compound_interest(amount, rate, start_date, end_date, frequency)
    print(f"Computed Interest: {round(interest, 2)}, Expected Interest: {expected_interest}")
    assert round(interest, 2) == expected_interest  # Rounded for comparison
