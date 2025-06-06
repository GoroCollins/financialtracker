# Generated by Django 5.0.11 on 2025-03-08 18:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('liabilities', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='interesttype',
            options={'verbose_name': 'Interest Type', 'verbose_name_plural': 'Interest Types'},
        ),
        migrations.AlterField(
            model_name='loan',
            name='interest_rate',
            field=models.DecimalField(decimal_places=2, default=12.5, help_text='Annual interest rate in percentage.', max_digits=4),
        ),
    ]
