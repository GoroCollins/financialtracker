from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

class ExpensesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'money_tracker.expenses'
    verbose_name = _("Expenses")