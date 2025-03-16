from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

class AssetsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'money_tracker.assets'
    verbose_name = _("Assets")