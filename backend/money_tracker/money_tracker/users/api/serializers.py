from rest_framework import serializers
from dj_rest_auth.serializers import LoginSerializer, TokenSerializer, UserDetailsSerializer
from money_tracker.users.models import User


class UserSerializer(serializers.ModelSerializer[User]):
    full_name = serializers.CharField(read_only=True)
    class Meta:
        model = User
        fields = ["username", "first_name", "middle_name", "last_name", "full_name", "url", "profile_image"]

        extra_kwargs = {
            "url": {"view_name": "api:user-detail", "lookup_field": "username"},
        }

class CustomUserDetailsSerializer(UserDetailsSerializer):
    profile_image = serializers.ImageField(required=False) # read_only=True
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = UserDetailsSerializer.Meta.model
        fields = UserDetailsSerializer.Meta.fields + ('profile_image','full_name',)

class CustomTokenSerializer(TokenSerializer):
    user = CustomUserDetailsSerializer(read_only=True)  # Use your custom user serializer

    class Meta:
        model = User
        fields = ('key', 'user')  # Include the user details in the login response