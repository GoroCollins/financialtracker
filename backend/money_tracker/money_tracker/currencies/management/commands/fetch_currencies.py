import requests
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from money_tracker.currencies.models import Currency

User = get_user_model()

CURRENCY_API_URL = "https://openexchangerates.org/api/currencies.json"

class Command(BaseCommand):
    help = "Fetches global currency codes and populates the Currency table"

    def add_arguments(self, parser):
        parser.add_argument(
            '--user',
            required=True,
            help="Username or ID of the user running this command"
        )

    def handle(self, *args, **options):
        user_identifier = options['user']
        user = None

        # Try getting the user
        try:
            if user_identifier.isdigit():
                user = User.objects.get(pk=int(user_identifier))
            else:
                user = User.objects.get(username=user_identifier)
        except User.DoesNotExist:
            raise CommandError(f"User '{user_identifier}' not found.")

        self.stdout.write(f"Fetching currency codes using user: {user.username}...")

        try:
            response = requests.get(CURRENCY_API_URL)
            response.raise_for_status()
            data = response.json()

            created, updated = 0, 0
            for code, description in data.items():
                try:
                    obj = Currency.objects.get(code=code)
                    obj.description = description
                    obj.modified_by = user
                    obj.save(update_fields=["description", "modified_by"])
                    updated += 1
                except Currency.DoesNotExist:
                    obj = Currency.objects.create(
                        code=code,
                        description=description,
                        created_by=user,
                    )
                    created += 1

            self.stdout.write(self.style.SUCCESS(
                f"Currency sync complete: {created} added, {updated} updated."
            ))
        except requests.RequestException as e:
            self.stderr.write(self.style.ERROR(f"Error fetching currency codes: {e}"))