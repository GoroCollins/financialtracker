from .api.views import LiquidAssetViewSet, EquityViewSet, InvestmentAccountViewSet, RetirementAccountViewSet, TotalAssetsAPIView
from rest_framework import routers
from django.urls import path

router = routers.DefaultRouter()
router.register('liquidassets', LiquidAssetViewSet, basename='liquidasset')
router.register('equities', EquityViewSet, basename='equity')
router.register('investmentaccounts', InvestmentAccountViewSet, basename='investmentaccount')
router.register('retirementaccounts', RetirementAccountViewSet, basename='retirementaccount')

app_name = "assets"

urlpatterns = router.urls

urlpatterns += [
    path('totalassets/', TotalAssetsAPIView.as_view(), name='totalassets')
]