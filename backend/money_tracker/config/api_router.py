from django.conf import settings
from rest_framework.routers import DefaultRouter
from rest_framework.routers import SimpleRouter
from django.urls import path, include

from money_tracker.users.api.views import UserViewSet

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

router.register("users", UserViewSet)


app_name = "api"
urlpatterns = router.urls

urlpatterns += [
    path('currencies/', include('money_tracker.currencies.urls')),
    path('income/', include('money_tracker.income.urls')),
    path('assets/', include('money_tracker.assets.urls')),
    path('liabilities/', include('money_tracker.liabilities.urls')),
    path('expenses/', include('money_tracker.expenses.urls')),
]
