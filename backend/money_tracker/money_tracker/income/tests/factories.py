import factory
from ..models import EarnedIncome, PortfolioIncome, PassiveIncome
from money_tracker.currencies.tests.factories import CurrencyFactory
from decimal import Decimal
from django.conf import settings
from ...currencies.mixins import CurrencyConversionMixin

User = settings.AUTH_USER_MODEL

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        skip_postgeneration_save = True  # Prevents unnecessary saves

    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    password = factory.PostGenerationMethodCall("set_password", "password123")

    @factory.post_generation
    def groups(self, create, extracted, **kwargs):
        if create and extracted:
            self.groups.set(extracted)

class BaseIncomeFactory(factory.django.DjangoModelFactory):
    income_name = factory.Faker("company")
    currency = factory.SubFactory(CurrencyFactory)
    amount = factory.Faker("pydecimal", left_digits=6, right_digits=2, positive=True)
    notes = factory.Faker("text")
    created_by = factory.SubFactory(UserFactory)

    @factory.lazy_attribute
    def amount_lcy(self):
        return self.currency.exchange_rate * self.amount if hasattr(self.currency, "exchange_rate") else self.amount

    class Meta:
        abstract = True

class EarnedIncomeFactory(BaseIncomeFactory):
    class Meta:
        model = EarnedIncome

class PortfolioIncomeFactory(BaseIncomeFactory):
    class Meta:
        model = PortfolioIncome

class PassiveIncomeFactory(BaseIncomeFactory):
    class Meta:
        model = PassiveIncome