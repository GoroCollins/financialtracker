from rest_framework import serializers
from dj_rest_auth.serializers import LoginSerializer, TokenSerializer, UserDetailsSerializer
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
# from dj_rest_auth.registration.views import SocialLoginView
from money_tracker.users.models import User


class UserSerializer(serializers.ModelSerializer[User]):
    class Meta:
        model = User
        fields = ["username", "name", "url"]

        extra_kwargs = {
            "url": {"view_name": "api:user-detail", "lookup_field": "username"},
        }

class CustomUserDetailsSerializer(UserDetailsSerializer):
    #profile_image = serializers.ImageField(read_only=True)
    name = serializers.CharField()

    class Meta:
        model = UserDetailsSerializer.Meta.model
        fields = UserDetailsSerializer.Meta.fields + ('name',)

class CustomTokenSerializer(TokenSerializer):
    user = CustomUserDetailsSerializer(read_only=True)  # Use your custom user serializer

    class Meta:
        model = User
        fields = ('key', 'user')  # Include the user details in the login response
        

# def get_social_login_view():
#     """Lazy import to avoid circular import issues."""
#     from dj_rest_auth.registration.views import SocialLoginView # type: ignore
#     return SocialLoginView

# class GoogleLogin(get_social_login_view()):  # Import SocialLoginView dynamically
#     adapter_class = GoogleOAuth2Adapter
#     callback_url = "http://localhost:8000/accounts/google/login/callback/"
#     client_class = OAuth2Client