from rest_framework import serializers
from . import models
from rest_framework_simplejwt.views import TokenObtainPairView;
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer;
from .models import Company
from django.contrib.auth.models import User
from .models import Goal
import re
from django.db.models import Q
from django.db import IntegrityError
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework import status


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

    class Meta:
        model = models.Company
        fields = '__all__'
        read_only_fields = ['id']

class GoalSerializer(serializers.ModelSerializer):
    company = serializers.PrimaryKeyRelatedField(read_only=True)

    def create(self, validated_data):
        validated_data['company'] = self.context['request'].user.company
        return super().create(validated_data)


    class Meta:
        model = models.Goal
        fields = '__all__'
        read_only_fields = ['id']


class ReportSerializer(serializers.ModelSerializer):
    company = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = models.Report
        fields = '__all__'
        read_only_fields = ['id', 'company']

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