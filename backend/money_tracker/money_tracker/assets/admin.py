from django.contrib import admin
from .models import LiquidAsset, Equity, InvestmentAccount, RetirementAccount
# Register your models here.
admin.site.register(LiquidAsset)
admin.site.register(Equity)
admin.site.register(InvestmentAccount)
admin.site.register(RetirementAccount)
