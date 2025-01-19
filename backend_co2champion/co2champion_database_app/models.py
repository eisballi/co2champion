from decimal import Decimal
from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.utils import timezone
import datetime



######## CO2CHAMPION ########

class Company(models.Model):
    id = models.AutoField(primary_key=True)
    UID = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    total_employees = models.IntegerField()
    total_income = models.DecimalField(max_digits=15, decimal_places=2)
    current_rank = models.IntegerField()
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company', null=True)

    def __str__(self):
        return self.name

class RankHistory(models.Model):
    id = models.AutoField(primary_key=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='rank_history')
    rank = models.PositiveIntegerField(default=0)
    date = models.DateField()

    def clean(self):
        if RankHistory.objects.filter(company=self.company, date=self.date).exists():
            raise ValidationError("Es existiert bereits ein RankHistory-Eintrag für dieses Datum und diese Company.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class Goal(models.Model):
    id = models.AutoField(primary_key=True)
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='goal')
    start_emissions = models.DecimalField(max_digits=10, decimal_places=2)  # Max = 9.999.999,99 Tons/Year
    target_emissions = models.DecimalField(max_digits=10, decimal_places=2)  # Max = 9.999.999,99 Tons/Year
    start_date = models.DateField()
    deadline = models.DateField()

    def __str__(self):
        return f"Goal for {self.company.name}"

    def clean(self):
        errors = {}

        # Start Emissions mindestens 50 Tons/Year
        if self.start_emissions < Decimal('50'):
            errors['start_emissions'] = "Start Emissions must be at least 50 Tons/Year."

        # Start Emissions nicht mehr als 10.000.000 Tons/Year
        if self.start_emissions > Decimal('10000000'):
            errors['start_emissions'] = "Start Emissions cannot exceed 10,000,000 Tons/Year."

        # Target Emissions mindestens 20% kleiner als Start Emissions
        if self.target_emissions > self.start_emissions * Decimal('0.8'):
            errors['target_emissions'] = "Target Emissions must be at least 20% smaller than Start Emissions."

        # Target Emissions nicht mehr als 10.000.000 Tons/Year
        if self.target_emissions > Decimal('10000000'):
            errors['target_emissions'] = "Target Emissions cannot exceed 10,000,000 Tons/Year."

        # Start Date nach 1990 und nicht in der Zukunft
        if self.start_date.year < 1990:
            errors['start_date'] = "Start Date cannot be before the year 1990."
        if self.start_date > timezone.now().date():
            errors['start_date'] = "Start Date cannot be in the future."

        # Deadline muss in der Zukunft sein, vor 2150 und mindestens 6 Monate nach Start Date
        if self.deadline <= timezone.now().date():
            errors['deadline'] = "Deadline must be in the future."
        if self.deadline.year >= 2150:
            errors['deadline'] = "Deadline must be before the year 2150."
        if (self.deadline - self.start_date) < datetime.timedelta(days=180):
            errors['deadline'] = "Deadline must be at least 6 months after Start Date."

        # Deadline muss nach Start Date sein
        if self.deadline <= self.start_date:
            errors['deadline'] = "Deadline must be after Start Date."

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        # Stellen Sie sicher, dass clean immer vor dem Speichern aufgerufen wird
        self.full_clean()  # Ruft die clean-Methode auf
        super().save(*args, **kwargs)


class Report(models.Model):
    id = models.AutoField(primary_key=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='reports')
    title = models.CharField(max_length=200)
    description = models.TextField(max_length=800)
    date = models.DateField()
    reduced_emissions = models.DecimalField(max_digits=9, decimal_places=2) # Max = (-)999.999,99 Tons/Year

    def __str__(self):
        return self.title

