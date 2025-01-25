import datetime
from django.db.models import Q, Sum, F, Case, When, Value, FloatField, OuterRef, Subquery
from django.db import IntegrityError
from django.forms import ValidationError
from django.utils.timezone import now
from django.db.models.functions import Cast, Coalesce
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from co2champion_database_app.models import Company
from django.contrib.auth.models import User
from .models import Company, Goal, Report, RankHistory
from django.db.models import functions


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
                # 50% auf progress, 20% auf employees, 10% auf income
                score=(
                    Cast(F('progress'), FloatField()) * 0.7
                    + Cast(functions.Log(F('total_employees') + 1,10), FloatField()) * 0.2
                    + Cast(functions.Log(F('total_income') + 1,10), FloatField()) * 0.1
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
        return self.queryset.filter(company__user=self.request.user)

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = models.Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        
        return (
            self.queryset
            .annotate(
                total_reduced_emissions=Coalesce(
                    Sum(Cast('reports__reduced_emissions', FloatField())),
                    0.0,
                    output_field=FloatField()
                ),
                progress=Case(
                    When(
                        Q(goal__isnull=False) &
                        Q(goal__start_emissions__gt=F('goal__target_emissions')),
                        then=(
                            Cast(F('total_reduced_emissions'), FloatField())
                            / (
                                Cast(F('goal__start_emissions'), FloatField())
                                - Cast(F('goal__target_emissions'), FloatField())
                            )
                        ) * 100.0
                    ),
                    default=0.0,
                    output_field=FloatField()
                ),
                score=(
                    Cast(F('progress'), FloatField()) * 0.7
                    + Cast(functions.Log(F('total_employees') + 1, 10), FloatField()) * 0.2
                    + Cast(functions.Log(F('total_income') + 1, 10), FloatField()) * 0.1
                ),
            )
            .filter(user=self.request.user)
        )

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
                serializer.save(company=company)  
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
    
class MyAccountView(APIView):
    """
    Allows the logged-in user to:
      - GET their user + company data
      - PATCH/PUT to update
      - DELETE to remove the entire account (User + Company)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # user is request.user
        serializer = MyAccountSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = MyAccountSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        # same logic as patch, but partial=False if you prefer strict updates
        serializer = MyAccountSerializer(request.user, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        user = request.user
        try:
            if hasattr(user, 'company'):
                user.company.delete()  # Delete the associated Company
            user.delete()  # Delete the User itself
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)