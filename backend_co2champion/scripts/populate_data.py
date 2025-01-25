import random
from decimal import Decimal
from django.contrib.auth.models import User
from co2champion_database_app.models import Company, Goal, Report, RankHistory
from datetime import timedelta, date
from django.utils.timezone import now
import os
import django

# Django-Umgebung konfigurieren
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'co2champion.settings')  
django.setup()

# Füge hier deinen bestehenden Code ein


# Helper Functions
def random_email(name):
    domains = ["example.com", "mail.com", "business.com", "co2champion.com"]
    return f"{name.lower().replace(' ', '.')}@{random.choice(domains)}"

def random_date(start_year=1990, end_year=2025):
    start = date(start_year, 1, 1)
    end = date(end_year, 1, 1)
    delta = end - start
    random_days = random.randint(0, delta.days)
    return start + timedelta(days=random_days)

# Bekannte Firmennamen
company_names = [
    "Amazon", "Google", "Tesla", "Microsoft", "Apple", 
    "Meta", "IBM", "Intel", "Samsung", "BMW", 
    "Volkswagen", "Siemens", "Nike", "Adidas", "Coca-Cola", 
    "PepsiCo", "Procter & Gamble", "Unilever", "Nestle", "General Electric"
]

# Create Data
for i, company_name in enumerate(company_names, start=1):
    # Create User
    username = f"user{i}"
    user = User.objects.create_user(
        username=username,
        password="Password123!",
        email=random_email(company_name)
    )

    # Create Company
    company = Company.objects.create(
        UID=f"UID{i:04}",
        name=company_name,
        email=random_email(company_name),
        total_employees=random.randint(1000, 500000),  # Große Unternehmen haben viele Mitarbeiter
        total_income=Decimal(random.randint(500000000, 200000000000)),  # Repräsentativer Umsatz für bekannte Firmen
        current_rank=i,
        user=user
    )

    # Create Goal
    start_emissions = Decimal(random.randint(5000, 5000000))  # CO2-Emissionen realistischer
    target_emissions = start_emissions * Decimal('0.8')  # Ziel: <= 80% der Start-Emissionen
    start_date = now().date() - timedelta(days=360)  # Startdatum in der Vergangenheit
    deadline = now().date() + timedelta(days=random.randint(180, 365))  # Deadline in der Zukunft
    Goal.objects.create(
        company=company,
        start_emissions=start_emissions,
        target_emissions=target_emissions,
        start_date=start_date,
        deadline=deadline
    )

    # Create RankHistory
    for history_date in [start_date + timedelta(days=x * 30) for x in range(12)]:
        RankHistory.objects.create(
            company=company,
            rank=random.randint(1, 20),  # Rank über das Jahr verteilt
            date=history_date
        )

    # Create Reports
    for j in range(random.randint(1, 5)):  # Jede Firma bekommt 1-5 Berichte
        report_title = f"{company_name} Sustainability Report {j}"
        report_description = f"Detailed analysis of {company_name}'s efforts in report {j}."
        report_date = random_date(start_year=start_date.year, end_year=now().year)
        reduced_emissions = Decimal(random.randint(100, 50000))  # Realistische Emissionsreduktionen
        Report.objects.create(
            company=company,
            title=report_title,
            description=report_description,
            date=report_date,
            reduced_emissions=reduced_emissions
        )

print("20 companies, users, goals, and reports created successfully with well-known company names!")
