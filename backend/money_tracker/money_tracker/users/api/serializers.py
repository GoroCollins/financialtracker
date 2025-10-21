from rest_framework import serializers
from dj_rest_auth.serializers import LoginSerializer, TokenSerializer, UserDetailsSerializer, PasswordResetSerializer, PasswordResetConfirmSerializer
from money_tracker.users.models import User
from django.conf import settings
from dj_rest_auth.registration.serializers import RegisterSerializer
from django.contrib.auth.forms import PasswordResetForm
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from allauth.account.forms import default_token_generator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.translation import gettext_lazy as _
from allauth.account.utils import user_pk_to_url_str as uid_encoder
from allauth.account.utils import url_str_to_user_pk as uid_decoder



class UserSerializer(serializers.ModelSerializer[User]):
    full_name = serializers.CharField(read_only=True)
    class Meta:
        model = User
        fields = ["username", "first_name", "middle_name", "last_name", "full_name", "url", "profile_image", "phone_number"]

        extra_kwargs = {
            "url": {"view_name": "api:user-detail", "lookup_field": "username"},
        }

class CustomUserDetailsSerializer(UserDetailsSerializer):
    profile_image = serializers.ImageField(required=False) # read_only=True
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = UserDetailsSerializer.Meta.model
        fields = UserDetailsSerializer.Meta.fields + ('profile_image','full_name', "middle_name", "phone_number")

class CustomTokenSerializer(TokenSerializer):
    user = CustomUserDetailsSerializer(read_only=True)  # Use your custom user serializer

    class Meta:
        model = User
        fields = ('key', 'user')  # Include the user details in the login response


from allauth.account import app_settings as allauth_settings

def is_required(field_name: str) -> bool:
    """
    Check if a field is marked as required using the '*' suffix convention
    """
    required_fields = allauth_settings.SIGNUP_FIELDS
    return f"{field_name}*" in required_fields

class CustomRegisterSerializer(RegisterSerializer):
    username = serializers.CharField(required=is_required("username"))
    email = serializers.EmailField(required=is_required("email"))
    phone_number = serializers.CharField(required=is_required("phone_number"), allow_blank=True)
    middle_name = serializers.CharField(required=is_required("middle_name"), allow_blank=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._has_phone_field = "phone_number" in settings.ACCOUNT_SIGNUP_FIELDS

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['phone_number'] = self.validated_data.get('phone_number', '')
        data['middle_name'] = self.validated_data.get('middle_name', '')
        return data

    def custom_signup(self, request, user):
        user.phone_number = self.validated_data.get('phone_number', '')
        user.middle_name = self.validated_data.get('middle_name', '')
        user.save()
        return user
        
class CustomPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def save(self, **kwargs):
        request = self.context.get('request')
        email = self.validated_data['email']
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:8075")
        expiry_minutes = getattr(settings, "PASSWORD_RESET_TIMEOUT", 259200) // 60

        # Find all active users matching this email
        users = User.objects.filter(email__iexact=email, is_active=True)
        if not users.exists():
            return  # silently ignore invalid emails

        for user in users:
            # Encode UID properly (base36 if allauth, base64 if django)
            uid = uid_encoder(user)
            token = default_token_generator.make_token(user)
            reset_url = f"{frontend_url}/resetpassword/{uid}/{token}/"

            context = {
                "user": user,
                "user_name": user.full_name,
                "reset_url": reset_url,
                "frontend_url": frontend_url,
                "site_name": getattr(settings, "SITE_NAME", "My App"),
                "expiry_minutes": expiry_minutes,
            }

            subject = "Password Reset Request"
            html_message = render_to_string("djrestauth/custom_password_reset_email.html", context)
            plain_message = f"You requested a password reset.\nReset your password: {reset_url}"

            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                html_message=html_message,
            )
