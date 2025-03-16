from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

class LiabilitiesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'money_tracker.liabilities'
    verbose_name = _("Liabilities")