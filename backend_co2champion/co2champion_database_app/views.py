import datetime
from django.db.models import Q
from django.db import IntegrityError
from django.forms import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from co2champion_database_app.models import Company
from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Sum, F, Case, When, Value, FloatField, Q, OuterRef, Subquery
from rest_framework.pagination import PageNumberPagination
from django.db.models.functions import Cast
from .models import RankHistory
from django.db.models.functions import Cast
from django.utils.timezone import now
from django.db.models.functions import Cast, Coalesce





from .serializers import *
from . import models
import uuid

######## CO2CHAMPION ########

class RegisterAPIView(APIView):
    def post(self, request):
        company_name = request.data.get("company_name")
        email = request.data.get("email")
        password = request.data.get("password")

        if not company_name or not email or not password:
            return Response(
                {"error": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Überprüfen, ob die Firma existiert
        if Company.objects.filter(name=company_name).exists():
            return Response(
                {"error": "Company name already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Benutzername prüfen und ggf. anpassen
        original_username = company_name
        username = original_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{original_username}{counter}"
            counter += 1

        try:
            # Benutzer erstellen
            user = User.objects.create_user(username=username, email=email, password=password)

            # Firma erstellen und mit Benutzer verknüpfen
            company = Company.objects.create(
                name=company_name,
                email=email,
                password=password,
                UID=str(uuid.uuid4()),  # Unique Identifier generieren
                user=user,
                total_employees=0,  # Standardwerte
                total_income=0.00,
                current_rank=0
            )

            return Response(
                {"message": "Registration successful."},
                status=status.HTTP_201_CREATED
            )
        except IntegrityError as e:
            return Response(
                {"error": f"Integrity Error: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

class RankPagination(PageNumberPagination):
    page_size = 10  # Show top 10 companies per page


class RankViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CompanySerializer
    permission_classes = [AllowAny]
    pagination_class = RankPagination

    def get_queryset(self):
        today = datetime.date.today()

        companies = (
            Company.objects
            .annotate(
                # Um sicherzugehen, dass die Reports-Summe nicht Decimals mischt,
                # casten wir "reports__reduced_emissions" zu Float.
                # Coalesce wandelt None zu 0.0 (float).
                total_reduced_emissions=Coalesce(
                    Sum(Cast('reports__reduced_emissions', FloatField())),
                    0.0,
                    output_field=FloatField()
                ),

                # Progress in %
                progress=Case(
                    When(
                        Q(goal__isnull=False) &
                        Q(goal__start_emissions__gt=F('goal__target_emissions')),
                        then=(
                            Cast(F('total_reduced_emissions'), FloatField()) /
                            (
                                Cast(F('goal__start_emissions'), FloatField()) -
                                Cast(F('goal__target_emissions'), FloatField())
                            )
                        ) * 100.0
                    ),
                    default=0.0,
                    output_field=FloatField(),
                ),

                # Score-Berechnung: alles wird in Float gecastet
                # 50% auf progress, 30% auf employees, 20% auf income
                score=(
                    Cast(F('progress'), FloatField()) * 0.5
                    + Cast(F('total_employees'), FloatField()) * 0.3
                    + Cast(F('total_income'), FloatField()) * 0.2
                ),
            )
            .order_by('-score')
        )

        # Rank zuweisen
        for rank, company in enumerate(companies, start=1):
            company.current_rank = rank
            company.save()

            try:
                RankHistory.objects.update_or_create(
                    company=company,
                    date=today,
                    defaults={'rank': rank}
                )
            except ValidationError as e:
                print(f"Validation error for company {company.name}: {e}")

        return companies

    
class RankHistoryViewSet(viewsets.ModelViewSet):
    queryset = models.RankHistory.objects.all()
    serializer_class = RankHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(company=self.request.user.id)

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = models.Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Nur die eigene Company abrufen
        return self.queryset.filter(id=self.request.user.id)

    def update(self, request, *args, **kwargs):
        # Nur die eigene Company darf ihre Daten ändern
        if kwargs['pk'] != str(request.user.id):
            raise PermissionDenied("You are not allowed to edit this company.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Löschen wird generell nicht erlaubt
        raise PermissionDenied("Deleting a company is not allowed.")


class GoalViewSet(viewsets.ModelViewSet):
    queryset = models.Goal.objects.all()
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Nur Goals der eigenen Company anzeigen
        return self.queryset.filter(company=self.request.user.company)

    def create(self, request, *args, **kwargs):
        # Falls ein Ziel bereits existiert, aktualisiere es
        if hasattr(request.user, 'company'):
            company = request.user.company
            existing_goal = models.Goal.objects.filter(company=company).first()
            if existing_goal:
                serializer = self.get_serializer(existing_goal, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                self.perform_update(serializer)
                return Response(serializer.data, status=status.HTTP_200_OK)

            # Neues Ziel erstellen
            request.data['company'] = company.id
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            raise PermissionDenied("You do not belong to any company.")

    def update(self, request, *args, **kwargs):
        # Nur das eigene Goal darf geändert werden
        instance = self.get_object()
        if instance.company.id != request.user.company.id:
            raise PermissionDenied("You are not allowed to update this goal.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Löschen wird erlaubt, aber nur für die eigene Company
        instance = self.get_object()
        if instance.company.id != request.user.company.id:
            raise PermissionDenied("You are not allowed to update this goal.")
        return super().destroy(request, *args, **kwargs)


class ReportViewSet(viewsets.ModelViewSet):
    queryset = models.Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Nur Reports der eigenen Company anzeigen
        return self.queryset.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        # Automatisch die Firma aus dem Benutzer zuweisen
        if not hasattr(self.request.user, 'company'):
            raise PermissionDenied("You do not belong to any company.")
        serializer.save(company=self.request.user.company)


    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied("User is not authenticated.")
        if not hasattr(request.user, 'company'):
            raise PermissionDenied("User does not belong to any company.")
        return super().create(request, *args, **kwargs)

    def update(self, request, pk):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

def destroy(self, request, *args, **kwargs):
    # Löschen wird erlaubt, aber nur für die eigene Company
    instance = self.get_object()
    if instance.company.id != request.user.company.id:
        raise PermissionDenied("You are not allowed to update this goal.")
    return super().destroy(request, *args, **kwargs)
