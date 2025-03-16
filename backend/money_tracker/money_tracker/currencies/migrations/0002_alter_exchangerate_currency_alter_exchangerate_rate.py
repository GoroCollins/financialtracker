# Generated by Django 5.0.11 on 2025-02-05 15:07

import django.core.validators
import django.db.models.deletion
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('currencies', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exchangerate',
            name='currency',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='exchange_rates', related_query_name='exchange_rate', to='currencies.currency'),
        ),
        migrations.AlterField(
            model_name='exchangerate',
            name='rate',
            field=models.DecimalField(decimal_places=2, max_digits=8, validators=[django.core.validators.MinValueValidator(Decimal('0.1'))]),
        ),
    ]
