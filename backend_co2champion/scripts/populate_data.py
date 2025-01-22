import random
from decimal import Decimal
from django.contrib.auth.models import User
from co2champion_database_app.models import Company, Goal, Report, RankHistory
from datetime import timedelta, date
from django.utils.timezone import now

# Helper Functions
def random_email(name):
    domains = ["example.com", "mail.com", "business.com", "co2champion.com"]
    return f"{name.lower()}@{random.choice(domains)}"

def random_date(start_year=1990, end_year=2025):
    start = date(start_year, 1, 1)
    end = date(end_year, 1, 1)
    delta = end - start
    random_days = random.randint(0, delta.days)
    return start + timedelta(days=random_days)

# Create Data
for i in range(1, 21):
    # Create User
    username = f"user{i}"
    user = User.objects.create_user(
        username=username,
        password="Password123!",
        email=random_email(username)
    )

    # Create Company
    company_name = f"Company {i}"
    company = Company.objects.create(
        UID=f"UID{i:04}",
        name=company_name,
        email=random_email(company_name),
        total_employees=random.randint(4, 5000),
        total_income=Decimal(random.randint(5000, 10000000)),
        current_rank=i,
        user=user
    )

    # Create Goal
    start_emissions = Decimal(random.randint(50, 1000000))
    target_emissions = start_emissions * Decimal('0.8')  # Ensure it's <= 80% of start_emissions
    start_date = now().date() - timedelta(days=360)  # Ensure start_date is in the past
    deadline = now().date() + timedelta(days=random.randint(180, 365))  # Ensure deadline is in the future
    Goal.objects.create(
        company=company,
        start_emissions=start_emissions,
        target_emissions=target_emissions,
        start_date=start_date,
        deadline=deadline
    )

    # Create RankHistory
    RankHistory.objects.create(
        company=company,
        rank=i,
        date=now().date()
    )

    # Create Reports
    for j in range(random.randint(1, 5)):  # Each company gets 1-5 reports
        report_title = f"Report {i}-{j}"
        report_description = f"Description for {report_title}"
        report_date = random_date(start_year=start_date.year, end_year=now().year)
        reduced_emissions = Decimal(random.randint(1, 10000))
        Report.objects.create(
            company=company,
            title=report_title,
            description=report_description,
            date=report_date,
            reduced_emissions=reduced_emissions
        )

print("20 companies, users, goals, and reports created successfully!")
