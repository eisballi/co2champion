# Generated by Django 5.1.4 on 2025-01-19 22:25

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('co2champion_database_app', '0002_remove_movie_genres_remove_movie_actors_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='report',
            name='goal',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='reports', to='co2champion_database_app.goal'),
        ),
    ]