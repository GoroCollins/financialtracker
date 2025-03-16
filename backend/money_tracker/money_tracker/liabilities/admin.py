from django.contrib import admin
from .models import Loan, InterestType

# Register your models here.
admin.site.register(Loan)
admin.site.register(InterestType)