from django.contrib import admin
from .models import FixedExpense, VariableExpense, DiscretionaryExpense
# Register your models here.
admin.site.register(FixedExpense)
admin.site.register(VariableExpense)
admin.site.register(DiscretionaryExpense)