from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Créer un routeur pour les API REST
router = DefaultRouter()
router.register(r'universities', views.UniversityViewSet)
router.register(r'recycling-plants', views.RecyclingPlantViewSet)
router.register(r'production-data', views.ProductionDataViewSet)
router.register(r'research-projects', views.ResearchProjectViewSet)

urlpatterns = [
    # API REST URLs
    path('api/', include(router.urls)),
    path('api/production-history/', views.ProductionHistoryView.as_view(), name='production-history'),
    
    # API pour récupérer les informations utilisateur
    path('api/user/', views.UserView.as_view(), name='user'),
    
    # API pour les configurations du dashboard
    path('api/dashboard-settings/', views.DashboardSettingsView.as_view(), name='dashboard-settings'),
] 