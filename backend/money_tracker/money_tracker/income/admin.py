from django.contrib import admin
from .models import EarnedIncome, PortfolioIncome, PassiveIncome
# Register your models here.
admin.site.register(EarnedIncome)
admin.site.register(PortfolioIncome)
admin.site.register(PassiveIncome)