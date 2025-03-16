from celery import shared_task
from django.utils import timezone
from .models import Loan
import logging

logger = logging.getLogger(__name__)

@shared_task
def check_loan_default():
    """Check and update loans that have defaulted."""
    today = timezone.localdate()
    
    # Filter loans that are not in default but have overdue balances
    defaulted_loans = Loan.objects.filter(in_default=False, due_balance__gt=0, repayment_date__lte=today)
    
    count = defaulted_loans.count()
    
    if count > 0:
        defaulted_loans.update(in_default=True)
        logger.info(f"Marked {count} loans as defaulted on {today}.")
    
    # TODO: Implement email notification for affected users
    
    return f"Loan default check completed. Updated {defaulted_loans.count()} loans."