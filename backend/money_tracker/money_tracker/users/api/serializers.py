from rest_framework import serializers
from dj_rest_auth.serializers import LoginSerializer, TokenSerializer, UserDetailsSerializer
from money_tracker.users.models import User
from django.conf import settings
from dj_rest_auth.registration.serializers import RegisterSerializer


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
        

# class CustomRegisterSerializer(RegisterSerializer):
#     phone_number = serializers.CharField(required=False)
#     middle_name = serializers.CharField(required=False)
#     _has_phone_field = True  # 🛠️ Important for compatibility with allauth

#     def get_cleaned_data(self):
#         data = super().get_cleaned_data()
#         data['phone_number'] = self.validated_data.get('phone_number', '')
#         data['middle_name'] = self.validated_data.get('middle_name', '')
#         return data

#     def custom_signup(self, request, user):
#         user.phone_number = self.validated_data.get('phone_number', '')
#         user.middle_name = self.validated_data.get('middle_name', '')
#         user.save()
#         return user


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

