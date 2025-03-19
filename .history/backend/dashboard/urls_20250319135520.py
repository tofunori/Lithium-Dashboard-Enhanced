from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView
from rest_framework.response import Response
from core.views import RefineryViewSet, DashboardSettingsViewSet, CurrentUserView

# Classe simple pour simuler l'historique de production
class ProductionHistoryView(APIView):
    def get(self, request):
        # Données factices pour l'historique de production
        return Response([])

# Classe pour rediriger les appels de recycling-plants vers refineries
class RecyclingPlantView(APIView):
    def get(self, request):
        # Obtenir les données de refineries et les retourner au format attendu par le frontend
        refineries = RefineryViewSet().get_queryset()
        data = []
        for refinery in refineries:
            data.append({
                'id': refinery.id,
                'name': refinery.name,
                'location': refinery.location,
                'recycling_rate': 75,  # Valeur factice
                'active': refinery.status == 'operational',
                'capacity': '10000',  # Valeur factice
                'current_production': '7500',  # Valeur factice
                'latitude': refinery.latitude,
                'longitude': refinery.longitude
            })
        return Response(data)

router = DefaultRouter()
router.register(r'refineries', RefineryViewSet)
router.register(r'settings', DashboardSettingsViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/user/', CurrentUserView.as_view(), name='current-user'),
    path('api/production-history/', ProductionHistoryView.as_view(), name='production-history'),
    path('api/recycling-plants/', RecyclingPlantView.as_view(), name='recycling-plants'),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('api-auth/', include('rest_framework.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)