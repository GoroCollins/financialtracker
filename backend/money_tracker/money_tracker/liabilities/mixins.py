from money_tracker.currencies.models import ExchangeRate
from django.core.exceptions import ObjectDoesNotExist, ValidationError
import logging
from datetime import datetime
from dateutil.relativedelta import relativedelta
from decimal import Decimal
logger = logging.getLogger(__name__)

class CurrencyConversionMixin:
    def convert_to_lcy(self, amount, currency):
        """
        Converts the given amount to the local currency using the exchange rate.
        If the currency is local, the amount is returned as-is.
        :param amount: Decimal, amount to convert.
        :param currency: Currency object, the foreign currency.
        :return: Decimal, converted amount in local currency.
        """
        if currency.is_local:
            # If the currency is local, no conversion is needed
            return amount
        else:
            try:
                exchange_rate = ExchangeRate.objects.get(currency=currency)
                return amount * exchange_rate.rate
            except ObjectDoesNotExist:
                # Log the error and raise a ValidationError
                logger.error(f"Missing exchange rate for currency {currency}")
                raise ValidationError({"currency": f"No exchange rate found for currency {currency}"})
            

class InterestCalculationMixin:
    def calculate_interest(self, amount, rate, interest_type, loan):
        """
        Determines the type of interest calculation.
        
        :param amount: Decimal, the principal amount.
        :param rate: Decimal, the annual interest rate.
        :param interest_type: InterestTypes object, contains loan details and interest type.
        :return: Decimal, the calculated interest amount.
        """
        if rate is None:
            raise ValidationError({"rate": "Interest rate must be provided."})

        if interest_type.code == "SIMPLE":
            return self.calculate_simple_interest(amount, rate, loan.loan_date, loan.repayment_date)
        elif interest_type.code == "COMPOUND":
            return self.calculate_compound_interest(amount, rate, loan.loan_date, loan.repayment_date, loan.compound_frequency)
        else:
            raise ValueError(f"Invalid interest type: {interest_type.code}")


    def calculate_simple_interest(self, amount, rate, start_date, end_date):
        """Calculates simple interest based on actual days elapsed."""
        days = (end_date - start_date).days  # Get duration in days
        if days <= 0:
            raise ValidationError({"repayment_date": "Repayment date must be after loan date."})

        return (amount * rate / Decimal(100)) * (Decimal(days) / Decimal(365))  # Annual interest

    def calculate_compound_interest(self, amount, rate, start_date, end_date, compounding_frequency=12):
        """
        Calculates compound interest using the formula:
            A = P(1 + r/n)^(nt)
        Where:
        - P = principal
        - r = annual rate (as decimal)
        - n = number of times compounded per year (default monthly: 12)
        - t = time in years
        """
        days = (end_date - start_date).days  # Get duration in days
        if days <= 0:
            raise ValidationError({"repayment_date": "Repayment date must be after loan date."})

        years = Decimal(days) / Decimal(365)  # Convert days to years
        n = Decimal(compounding_frequency)
        rate_decimal = rate / Decimal(100)  # Convert rate to decimal

        amount_due = amount * (1 + rate_decimal / n) ** (n * years)
        return amount_due - amount  # Interest earned
