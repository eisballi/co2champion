from django.db import migrations

def create_groups(apps,schema_editor):
    Group = apps.get_model("auth","Group")
    Group.objects.get_or_create(name="Content Editors")
    Group.objects.get_or_create(name="Content Administrators")

class Migration(migrations.Migration):

    dependencies = [
        ('co2champion_database_app', '0005_alter_movie_revenue'),
    ]

    operations = [
        migrations.RunPython(create_groups)
    ]
