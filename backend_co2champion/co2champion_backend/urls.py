from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from co2champion_database_app.serializers import MyTokenObtainPairView
from co2champion_database_app.views import CompanyViewSet, GoalViewSet, RankHistoryViewSet, RankViewSet, RegisterAPIView, ReportViewSet, MyAccountView

router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='reports')
router.register(r'company', CompanyViewSet, basename='company')
router.register(r'goal', GoalViewSet, basename='goal')
router.register(r'ranking', RankViewSet, basename='ranking')
router.register(r'rank-history', RankHistoryViewSet, basename='rank-history')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('api/register/', RegisterAPIView.as_view(), name='register'),
    path('my-account/', MyAccountView.as_view(), name='my-account'),
    path('api/my-account/', MyAccountView.as_view(), name='my-account'),
]

