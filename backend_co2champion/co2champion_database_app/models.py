import datetime
from django.db import models
from django.core.exceptions import ValidationError

class Genre(models.Model):

    name = models.CharField(max_length=4096)

    def __str__(self):
        return self.name

class Person(models.Model):

    name = models.CharField(max_length=70)

    def __str__(self):
        return self.name

class Movie(models.Model):

    rank = models.PositiveIntegerField()
    title = models.CharField(max_length=4096)
    genres = models.ManyToManyField(Genre)
    actors = models.ManyToManyField(Person,related_name="actors")
    description = models.TextField()
    director = models.ForeignKey(Person,on_delete=models.PROTECT,related_name="director")
    year = models.IntegerField(null=True)
    released = models.DateField(default=datetime.date.today)
    run_time = models.PositiveIntegerField(help_text="in minutes")
    rating = models.DecimalField(max_digits=2,decimal_places=1)
    revenue = models.DecimalField(max_digits=8,decimal_places=2,null=True)
    visible = models.BooleanField(default=True)
    black_and_white = models.BooleanField(default=False)

    def __str__(self):
        return self.title

######## CO2CHAMPION ########

class Company(models.Model):
    id = models.AutoField(primary_key=True)
    UID = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)  # In production, use hashed passwords
    total_employees = models.IntegerField()
    total_income = models.DecimalField(max_digits=15, decimal_places=2)
    rank = models.IntegerField()

    def __str__(self):
        return self.name

class Goal(models.Model):
    id = models.AutoField(primary_key=True)
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='goal')
    current_emissions = models.DecimalField(max_digits=10, decimal_places=2) # Max = 9.999.999,99 Tons/Year
    target_emissions = models.DecimalField(max_digits=10, decimal_places=2) # Max = 9.999.999,99 Tons/Year
    deadline = models.DateField()
    start_date = models.DateField()

    def __str__(self):
        return f"Goal for {self.company.name}"

    ### Hier die Regeln wie im Excel definiert einbauen (sofern hier möglich)
    ### Vllt muss man es auch im serializer extra definieren, das muss man dann ausprobieren
    def clean(self):
        if self.target_emissions > self.current_emissions:
            raise ValidationError("Target-Emissions cannot be greater than Current-Emissions.")
        if self.start_date > self.deadline:
            raise ValidationError("Start-Date cannot be after the Deadline.")
        if self.start_date.year < 1990:
            raise ValidationError("Start-Date cannot be after the Deadline.")

    def save(self, *args, **kwargs):
        # Wir stellen sicher, dass `clean` immer vor dem Speichern aufgerufen wird
        self.full_clean()  # Ruft die `clean`-Methode auf
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