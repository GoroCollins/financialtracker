# Generated by Django 5.0.11 on 2025-02-09 15:03

import django.db.models.functions.datetime
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('currencies', '0002_alter_exchangerate_currency_alter_exchangerate_rate'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='exchangerate',
            constraint=models.UniqueConstraint(condition=models.Q(('created_at__date', django.db.models.functions.datetime.TruncDate('created_at'))), fields=('currency',), name='unique_currency_per_day'),
        ),
    ]
