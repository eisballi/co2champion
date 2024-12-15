from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from co2champion_database_app.views import CompanyViewSet, GenreViewSet, GoalViewSet, MovieViewSet, PersonViewSet, RankViewSet, ReportViewSet



router = DefaultRouter()
router.register(r'genres', GenreViewSet, basename='genres')
router.register(r'movies', MovieViewSet, basename='movies')
router.register(r'persons', PersonViewSet, basename='persons')
router.register(r'reports', ReportViewSet, basename='reports')
router.register(r'company', CompanyViewSet, basename='company')
router.register(r'goal', GoalViewSet, basename='goal')
router.register(r'ranking', RankViewSet, basename='ranking')



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
]

