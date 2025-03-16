from .api. views import FixedExpenseViewSet, VariableExpenseViewSet, DiscretionaryExpenseViewSet, TotalExpensesAPIView
from rest_framework import routers
from django.urls import path

router = routers.DefaultRouter()
router.register('fixedexpenses', FixedExpenseViewSet, basename='fixedexpense')
router.register('variableexpenses', VariableExpenseViewSet, basename='variableexepense')
router.register('discretionaryexpenses', DiscretionaryExpenseViewSet, basename='discretionaryexpense')

app_name="expenses"

urlpatterns = router.urls

urlpatterns += [
    path('totalexpenses/', TotalExpensesAPIView.as_view(), name='totalexpenses')
]