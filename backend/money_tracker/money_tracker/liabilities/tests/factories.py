import factory
from django.utils import timezone
from decimal import Decimal
from django.contrib.auth import get_user_model

from ..models import InterestType, Loan
from money_tracker.currencies.models import Currency

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
        if not create:
            return
        if extracted:
            for group in extracted:
                self.groups.add(group)
        self.save()  # Explicit save to ensure groups are added

class InterestTypeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = InterestType

    code = factory.Iterator(["SIMPLE", "COMPOUND"])
    description = factory.LazyAttribute(lambda obj: obj.code.capitalize() + " Interest")
    created_by = factory.SubFactory(UserFactory)
    modified_by = None  # Can be updated in tests
    created_at = factory.LazyFunction(timezone.now)
    updated_at = factory.LazyFunction(timezone.now)

class CurrencyFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Currency
        skip_postgeneration_save = True

    code = factory.Faker("currency_code")
    description = factory.Faker("currency_name")
    is_local = False  # Default to False
    created_by = factory.SubFactory(UserFactory)
    modified_by = factory.SubFactory(UserFactory)

    @factory.post_generation
    def set_local(self, create, extracted, **kwargs):
        if not create:
            return
        if extracted:
            self.is_local = extracted
            self.save()

class LoanFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Loan

    source = factory.Faker("company")
    loan_date = factory.LazyFunction(timezone.localdate)
    currency = factory.SubFactory(CurrencyFactory)
    amount_taken = factory.Faker("pydecimal", left_digits=5, right_digits=2, positive=True)
    reason = factory.Faker("sentence", nb_words=6)
    interest_type = factory.SubFactory(InterestTypeFactory)
    compound_frequency = factory.Maybe(
        factory.LazyAttribute(lambda obj: obj.interest_type.code == "COMPOUND"),
        yes_declaration=factory.Faker("random_int", min=1, max=12),
        no_declaration=None,
    )
    repayment_date = factory.LazyFunction(lambda: timezone.localdate() + timezone.timedelta(days=365))
    interest_rate = Decimal("12.50")
    interest = Decimal("0.00")
    interest_lcy = Decimal("0.00")
    in_default = False
    amount_repay = Decimal("0.00")
    amount_repay_lcy = Decimal("0.00")
    amount_paid = Decimal("0.00")
    amount_paid_lcy = Decimal("0.00")
    due_balance = Decimal("0.00")
    due_balance_lcy = Decimal("0.00")
    created_by = factory.SubFactory(UserFactory)
    modified_by = None
    created_at = factory.LazyFunction(timezone.now)
    modified_at = factory.LazyFunction(timezone.now)
