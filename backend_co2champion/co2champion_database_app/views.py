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
from .models import Company, Goal, Report, RankHistory


from .serializers import *
from . import models
import uuid

######## CO2CHAMPION ########

class RegisterAPIView(APIView):
    permission_classes = [AllowAny]  # Jeder darf auf diesen Endpunkt zugreifen

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(
                    {"message": "Registration successful."},
                    status=status.HTTP_201_CREATED
                )
            except IntegrityError as e:
                return Response(
                    {"error": f"Integrity Error: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(company=self.request.user.company)

    def create(self, request, *args, **kwargs):
        company = request.user.company  # Die Firma des Nutzers abrufen

        if not company:
            return Response({"error": "User is not associated with a company."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Prüfen, ob bereits ein Goal für die Firma existiert
        existing_goal = Goal.objects.filter(company=company).first()

        if existing_goal:
            serializer = self.get_serializer(existing_goal, data=request.data, partial=True)
        else:
            # Das company-Feld korrekt setzen, ohne request.data direkt zu verändern
            serializer = self.get_serializer(data={**request.data, "company": company.id})

        if serializer.is_valid():
            if existing_goal:
                self.perform_update(serializer)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                serializer.save(company=company)  # ✅ Company explizit übergeben!
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.company != self.request.user.company:
            raise PermissionDenied("You are not allowed to update this goal.")

        # Alle Reports löschen, wenn Goal geändert wird
        Report.objects.filter(company=self.request.user.company).delete()

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.company != self.request.user.company:
            raise PermissionDenied("You are not allowed to delete this goal.")
        return super().destroy(request, *args, **kwargs)


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Nur Reports der eigenen Company anzeigen
        return self.queryset.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        # Die Logik zur Zuweisung von company wird im Serializer gehandhabt
        serializer.save()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Sicherstellen, dass der Report zur eigenen Company gehört
        if instance.company != request.user.company:
            raise PermissionDenied("You are not allowed to update this report.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.company != request.user.company:
            raise PermissionDenied("You are not allowed to delete this report.")
        return super().destroy(request, *args, **kwargs)