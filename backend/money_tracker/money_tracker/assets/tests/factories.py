import factory
from django.utils.timezone import now
from django.contrib.auth import get_user_model
from . .models import LiquidAsset, Equity, InvestmentAccount, RetirementAccount
from money_tracker.currencies.tests.factories import CurrencyFactory

User = get_user_model()

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

class BaseAssetFactory(factory.django.DjangoModelFactory):
    """Abstract factory for common asset fields."""
    
    currency = factory.SubFactory(CurrencyFactory)
    amount = factory.Faker("pydecimal", left_digits=6, right_digits=2, positive=True)
    notes = factory.Faker("text")
    created_by = factory.SubFactory(UserFactory)
    modified_by = None  # Ensuring it's None by default

    class Meta:
        abstract = True

class LiquidAssetFactory(BaseAssetFactory):
    class Meta:
        model = LiquidAsset

    source = factory.Faker("company")
    name = factory.Faker("company")

class EquityFactory(BaseAssetFactory):
    class Meta:
        model = Equity

    name = factory.Faker("company")
    ratio = factory.Faker("pydecimal", left_digits=1, right_digits=2, positive=True, min_value=0.1, max_value=1)

class InvestmentAccountFactory(BaseAssetFactory):
    class Meta:
        model = InvestmentAccount

    name = factory.Faker("company")

class RetirementAccountFactory(BaseAssetFactory):
    class Meta:
        model = RetirementAccount

    name = factory.Faker("company")
    employer = factory.Faker("company")
