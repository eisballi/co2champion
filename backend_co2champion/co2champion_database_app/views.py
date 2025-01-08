from django.db.models import Q
from django.db import IntegrityError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from co2champion_database_app.models import Company
from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

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

class RankViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API ViewSet, das alle Companies anzeigt, die von jedem gesehen werden können.
    """
    serializer_class = CompanySerializer
    permission_classes = [AllowAny]  # Jeder darf lesen
    queryset = models.Company.objects.all()

    def get_queryset(self):
        """
        Liefert die Top 10 Firmen zurück
        und fügt die eigene Firma als 11. hinzu, falls der Nutzer angemeldet ist
        und sie nicht bereits unter den Top 10 ist.
        """

        # Hole die obersten 10 Firmen, geordnet nach dem Rang
        # Angenommen das der Rank ausserhalb bestimmt wird, sonst hier den Algo-Aufruf
        top_companies = models.Company.objects.all().order_by('current_rank')[:10]

        # 11te Company wenn User nicht unter Top 10
        if self.user.is_authenticated:
            company = self.queryset.filter(id=self.request.user.id)
            if company not in top_companies:
                top_companies.append(company)

        return Response(CompanySerializer(top_companies, many=True).data)

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
