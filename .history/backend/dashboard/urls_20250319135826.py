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
        # Obtenir les données directement du modèle sans passer par le ViewSet
        from core.models import Refinery
        refineries = Refinery.objects.all()
        
        # Conversion des données dans un format compatible avec le frontend
        data = []
        
        # Boucler sur chaque raffinerie et la transformer au format attendu
        for refinery in refineries:
            # Extraire des valeurs numériques à partir du champ production
            capacity = '10000'  # Valeur par défaut
            if refinery.production and 'tpa' in refinery.production:
                try:
                    # Tentative d'extraction d'une valeur numérique
                    capacity = refinery.production.split(' ')[0].replace(',', '')
                except:
                    pass
            
            # Créer un dictionnaire pour chaque installation
            plant_data = {
                'id': refinery.id,
                'name': refinery.name,
                'location': refinery.location,
                'country': refinery.country,
                'recycling_rate': int(50 + refinery.id % 40),  # Valeur aléatoire entre 50 et 90%
                'active': refinery.status == 'operational',
                'capacity': capacity,
                'current_production': str(int(int(capacity.replace(',', '')) * 0.75) if capacity.isdigit() else 7500),  # 75% de la capacité
                'latitude': refinery.latitude,
                'longitude': refinery.longitude
            }
            
            data.append(plant_data)
            
        # Retourner les données au format JSON
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