import factory
from django.contrib.auth import get_user_model
from money_tracker.currencies.tests.factories import CurrencyFactory
from ..models import FixedExpense, VariableExpense, DiscretionaryExpense

User = get_user_model()

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

class BaseExpenseFactory(factory.django.DjangoModelFactory):
    expense_name = factory.Faker("word")
    currency = factory.SubFactory(CurrencyFactory)
    amount = factory.Faker("pydecimal", left_digits=5, right_digits=2, positive=True)
    amount_lcy = factory.Faker("pydecimal", left_digits=5, right_digits=2, positive=True)
    notes = factory.Faker("text")
    created_by = factory.SubFactory(UserFactory)
    modified_by = None

    class Meta:
        abstract = True

class FixedExpenseFactory(BaseExpenseFactory):
    class Meta:
        model = FixedExpense

class VariableExpenseFactory(BaseExpenseFactory):
    class Meta:
        model = VariableExpense

class DiscretionaryExpenseFactory(BaseExpenseFactory):
    class Meta:
        model = DiscretionaryExpense
