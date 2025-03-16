# Generated by Django 5.0.11 on 2025-02-23 07:44

import django.core.validators
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('currencies', '0003_exchangerate_unique_currency_per_day'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exchangerate',
            name='rate',
            field=models.DecimalField(decimal_places=2, help_text='Exchange rate against the local currency in two decimal places.', max_digits=8, validators=[django.core.validators.MinValueValidator(Decimal('0.1'))]),
        ),
    ]
