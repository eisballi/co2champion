# Generated by Django 5.1.4 on 2025-01-19 23:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('co2champion_database_app', '0003_report_goal'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='report',
            name='goal',
        ),
    ]
