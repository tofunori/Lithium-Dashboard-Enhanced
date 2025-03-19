from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Créer un routeur pour les API REST
router = DefaultRouter()
router.register(r'universities', views.UniversityViewSet)
router.register(r'recycling-plants', views.RecyclingPlantViewSet)
router.register(r'production-data', views.ProductionDataViewSet)
router.register(r'research-projects', views.ResearchProjectViewSet)
router.register(r'dashboard-settings', views.DashboardSettingsViewSet)

urlpatterns = [
    # API REST URLs
    path('api/', include(router.urls)),
    path('api/production-history/', views.ProductionHistoryView.as_view(), name='production-history'),
] 