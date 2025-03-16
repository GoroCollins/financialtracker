from .api.views import LoanViewSet, TotalLiabilitiesAPIView, InterestTypeViewSet
from rest_framework import routers
from django.urls import path

router = routers.DefaultRouter()
router.register('interesttypes', InterestTypeViewSet, basename='interesttype')
router.register('loans', LoanViewSet, basename='loan')
app_name = "liabilities"

urlpatterns = router.urls
urlpatterns += [
    path('totalliabilities/', TotalLiabilitiesAPIView.as_view(), name='totalliabilities')
]