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

router = DefaultRouter()
router.register(r'refineries', RefineryViewSet)
router.register(r'settings', DashboardSettingsViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/user/', CurrentUserView.as_view(), name='current-user'),
    path('api/production-history/', ProductionHistoryView.as_view(), name='production-history'),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('api-auth/', include('rest_framework.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)