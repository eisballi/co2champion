from datetime import date, timedelta
from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User

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
    company = models.OneToOneField(
        'Company',
        on_delete=models.CASCADE,
        related_name='goal'
    )
    start_emissions = models.DecimalField(max_digits=10, decimal_places=2)
    target_emissions = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    deadline = models.DateField()

    def __str__(self):
        return f"Goal for {self.company.name}"

    def clean(self):
        # Start-Emissions >= 50 und <= 10.000.000
        if self.start_emissions < 50 or self.start_emissions > 10_000_000:
            raise ValidationError("Start Emissions must be between 50 and 10,000,000 tons/year.")

        # Target-Emissions <= 10.000.000
        if self.target_emissions > 10_000_000:
            raise ValidationError("Target Emissions must be <= 10,000,000 tons/year.")

        # Target mindestens 20% niedriger als Start => target <= 0.8 * start
        if self.target_emissions > (self.start_emissions * 0.8):
            raise ValidationError("Target must be at least 20% lower than Start Emissions.")

        # Start-Date >= 1990, nicht in der Zukunft
        if self.start_date.year < 1990:
            raise ValidationError("Start Date cannot be before 1990.")
        if self.start_date > date.today():
            raise ValidationError("Start Date cannot be in the future.")

        # Deadline < 2150
        if self.deadline.year >= 2150:
            raise ValidationError("Deadline must be before the year 2150.")

        # Deadline in der Zukunft und min. 6 Monate nach Start-Date
        if self.deadline <= date.today():
            raise ValidationError("Deadline must be in the future.")
        min_deadline = self.start_date + timedelta(days=180)  # ~6 Monate
        if self.deadline <= min_deadline:
            raise ValidationError("Deadline must be at least 6 months after the Start Date.")

    def save(self, *args, **kwargs):
        self.full_clean()
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

