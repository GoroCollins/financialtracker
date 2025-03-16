import factory
from ..models import Currency, ExchangeRate
from decimal import Decimal
from django.conf import settings

User = settings.AUTH_USER_MODEL

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        skip_postgeneration_save = True  # Prevents unnecessary saves

    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    password = factory.PostGenerationMethodCall("set_password", "password123")
    name = factory.Faker("name")
    @factory.post_generation
    def groups(self, create, extracted, **kwargs):
        if create and extracted:
            self.groups.set(extracted)  # Use `.set()` instead of looping + `add()` for efficiency


class CurrencyFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Currency
        skip_postgeneration_save = True

    code = factory.Faker("currency_code")
    description = factory.Faker("currency_name")
    is_local = False  # Default to False
    created_by = factory.SubFactory(UserFactory)
    # modified_by = factory.SubFactory(UserFactory)

    @factory.post_generation
    def set_local(self, create, extracted, **kwargs):
        if not create:
            return
        if extracted:
            self.is_local = extracted
            self.save()


class ExchangeRateFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ExchangeRate
        skip_postgeneration_save = True

    currency = factory.SubFactory(CurrencyFactory)
    rate = factory.Faker("pydecimal", left_digits=6, right_digits=2, positive=True)
    created_by = factory.SubFactory(UserFactory)
    # modified_by = factory.SubFactory(UserFactory)

    @factory.post_generation
    def validate_currency(self, create, extracted, **kwargs):
        if not create:
            return
        if self.currency.is_local:
            raise ValueError("Exchange rates cannot be assigned to a local currency.")