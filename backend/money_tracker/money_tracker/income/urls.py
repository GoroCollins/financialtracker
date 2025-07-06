from rest_framework.routers import DefaultRouter
from django.urls import path
from .api.views import EarnedIncomeViewSet, PortfolioIncomeViewSet, PassiveIncomeViewSet, TotalIncomeAPIView
from money_tracker.currencies.api.views import CurrencyViewSet

router = DefaultRouter()

router.register('earnedincome', EarnedIncomeViewSet, basename='earnedincome')
router.register('portfolioincome', PortfolioIncomeViewSet, basename='portfolioincome')
router.register('passiveincome', PassiveIncomeViewSet, basename='passiveincome')

app_name = "income"

urlpatterns = [
    *router.urls,
    path('totalincome/', TotalIncomeAPIView.as_view(), name='totalincome'),
]
