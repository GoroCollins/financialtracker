from django.contrib.auth.models import AbstractUser
from django.db.models import CharField, ImageField
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField


class User(AbstractUser):
    """
    Default custom user model for Money Tracker.
    If adding fields that need to be filled at user signup,
    check forms.SignupForm and forms.SocialSignupForms accordingly.
    """

    # First and last name do not cover name patterns around the globe
    first_name = CharField(_("First Name"), blank=True, max_length=255)  # type: ignore[assignment]
    middle_name = CharField(_("Middle Name"), blank=True, max_length=255)
    last_name = CharField(_("Last Name"), blank=True, max_length=255)  # type: ignore[assignment]
    profile_image = ImageField(upload_to='uploads/images', null=True, blank=True)
    phone_number = PhoneNumberField(null=True, blank=True, help_text="User's Phone Number")
    
    @property
    def full_name(self):
        return " ".join(filter(None, [self.first_name, self.middle_name, self.last_name]))

    def get_absolute_url(self) -> str:
        """Get URL for user's detail view.

        Returns:
            str: URL for user detail.

        """
        return reverse("users:detail", kwargs={"username": self.username})
