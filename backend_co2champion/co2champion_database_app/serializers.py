from venv import logger
from rest_framework import serializers
from . import models
from rest_framework_simplejwt.views import TokenObtainPairView;
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer;
from django.contrib.auth.models import User
import re
from django.db.models import Q
from django.db import IntegrityError
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal
from .models import Goal, Company, Report
import logging





######## CO2CHAMPION ########

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        if hasattr(user, 'company'):
            token['company_id'] = user.company.id
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class CompanySerializer(serializers.ModelSerializer):
    progress = serializers.FloatField(read_only=True)
    score = serializers.FloatField(read_only=True)
    total_reduction = serializers.FloatField(read_only=True)

    class Meta:
        model = models.Company
        fields = '__all__'
        read_only_fields = ['id']


class GoalSerializer(serializers.ModelSerializer):
    company = serializers.PrimaryKeyRelatedField(read_only=True)
    start_emissions = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal('50'),
        max_value=Decimal('10000000')
    )
    target_emissions = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal('1'),
        max_value=Decimal('10000000')
    )

    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ['id']

    def validate_target_emissions(self, value):
        start_emissions = self.initial_data.get('start_emissions')
        if start_emissions is not None:
            try:
                start_emissions = Decimal(str(start_emissions))
                if value > start_emissions * Decimal('0.8'):
                    raise serializers.ValidationError("Target Emissions must be at least 20% smaller than Start Emissions.")
            except:
                raise serializers.ValidationError("Start Emissions must be a valid number.")
        return value


logger = logging.getLogger(__name__)

class ReportSerializer(serializers.ModelSerializer):
    company = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'company', 'title', 'description', 'date', 'reduced_emissions']
        read_only_fields = ['id', 'company']

    def validate_title(self, value):
        if len(value) > 200:
            raise serializers.ValidationError("Title cannot exceed 200 characters.")
        return value

    def validate_description(self, value):
        if len(value) > 800:
            raise serializers.ValidationError("Description cannot exceed 800 characters.")
        return value

    def validate_reduced_emissions(self, value):
        if value <= 0:
            raise serializers.ValidationError("Emissions Reduced must be positive.")
        if value > Decimal('100000'):
            raise serializers.ValidationError("Emissions Reduced cannot exceed 100,000 Tons/Year.")
        return value

    def validate(self, data):
        """
        Cross-field Validierungen:
        - Reduced Emissions dürfen nicht größer als Start Emissions sein.
        """
        user = self.context['request'].user
        company = user.company

        try:
            goal = company.goal  # Das Ziel der Firma abrufen
        except Goal.DoesNotExist:
            raise serializers.ValidationError("No goal set for your company.")

        reduced_emissions = data.get('reduced_emissions')
        date = data.get('date')


        if reduced_emissions > goal.start_emissions:
            raise serializers.ValidationError("Emissions Reduced cannot exceed Start Emissions.")

        # Datum muss innerhalb der Zielperiode sein
        if date < goal.start_date:
            raise serializers.ValidationError("Report Date must be after the Goal's Start Date.")
        if date > goal.deadline:
            raise serializers.ValidationError("Report Date must be before the Goal's Deadline.")

        # Set the company
        data['company'] = company

        return data

    def create(self, validated_data):
        return Report.objects.create(**validated_data)


class RankHistorySerializer(serializers.ModelSerializer):
    company = serializers.PrimaryKeyRelatedField(queryset=models.Company.objects.all())

    class Meta:
        model = models.RankHistory
        fields = '__all__'
        read_only_fields = ['id']

class RepresentativeSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value

class RegisterSerializer(serializers.Serializer):
    company_name = serializers.CharField(max_length=255)
    company_uid = serializers.CharField(max_length=20)
    employee_size = serializers.IntegerField(min_value=4)
    total_income = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=5000)
    representative = RepresentativeSerializer()

    def validate_company_name(self, value):
        if not re.match(r"^[A-Za-z0-9 &]+$", value):
            raise serializers.ValidationError(
                "Company name can only contain letters, numbers, spaces, and '&'."
            )
        if Company.objects.filter(name=value).exists():
            raise serializers.ValidationError("Company name already exists.")
        return value

    # >>>>>> NEU: company_uid validieren <<<<<<
    def validate_company_uid(self, value):
        """
        Prüft, ob die UID bereits existiert.
        """
        if Company.objects.filter(UID=value).exists():
            raise serializers.ValidationError("UID already exists.")
        return value
    # >>>>>> ENDE NEU <<<<<<

    def create(self, validated_data):
        rep_data = validated_data.pop('representative')

        # Unternehmensdaten
        company_name = validated_data['company_name']
        company_uid = validated_data['company_uid']
        employee_size = validated_data['employee_size']
        total_income = validated_data['total_income']

        # Repräsentant-Daten
        rep_first_name = rep_data['first_name']
        rep_last_name = rep_data['last_name']
        rep_username = rep_data['username']
        rep_email = rep_data['email']
        rep_password = rep_data['password']

        # Neuen User anlegen
        user = User.objects.create_user(
            username=rep_username,
            email=rep_email,
            password=rep_password,
            first_name=rep_first_name,
            last_name=rep_last_name
        )

        # Firma anlegen und mit User verknüpfen
        company = Company.objects.create(
            name=company_name,
            UID=company_uid,          # <--- Hier
            email=rep_email,
            user=user,
            total_employees=employee_size,
            total_income=total_income,
            current_rank=0
        )

        return company