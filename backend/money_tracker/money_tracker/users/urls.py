from django.urls import path

from .views import user_detail_view
from .views import user_redirect_view
from .views import user_update_view
from . views import AuthStatusView

app_name = "users"
urlpatterns = [
    path("auth/status/", AuthStatusView.as_view(), name='auth-status'),
    path("~redirect/", view=user_redirect_view, name="redirect"),
    path("~update/", view=user_update_view, name="update"),
    path("<str:username>/", view=user_detail_view, name="detail"),
]
