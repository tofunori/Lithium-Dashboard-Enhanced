from django.shortcuts import render
from rest_framework import viewsets, permissions, status, generics, filters
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from .models import RecyclingPlant, DashboardSettings, University, ProductionData, ResearchProject
from .serializers import RecyclingPlantSerializer, RecyclingPlantCreateUpdateSerializer, DashboardSettingsSerializer, UserSerializer, UniversitySerializer, ProductionDataSerializer, ResearchProjectSerializer, PlantSummarySerializer, ProductionHistorySerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    """Autoriser l'accès en lecture à tous, mais accès en écriture uniquement aux administrateurs"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class RecyclingPlantViewSet(viewsets.ModelViewSet):
    """API pour gérer les installations de recyclage"""
    queryset = RecyclingPlant.objects.all()
    serializer_class = RecyclingPlantSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['university', 'active']
    search_fields = ['name', 'address']
    ordering_fields = ['name', 'capacity', 'opening_date']
    
    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        """Endpoint spécifique pour le dashboard avec des données résumées"""
        plants = self.get_queryset()
        serializer = PlantSummarySerializer(plants, many=True)
        return Response(serializer.data)


class DashboardSettingsViewSet(viewsets.ModelViewSet):
    queryset = DashboardSettings.objects.all()
    serializer_class = DashboardSettingsSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Obtenir les paramètres actuels du dashboard ou créer des paramètres par défaut si aucun n'existe"""
        settings = DashboardSettings.objects.first()
        
        if not settings:
            # Créer des paramètres par défaut
            default_status_colors = {
                "operational": "#4CAF50",
                "construction": "#FF9800",
                "planned": "#2196F3",
                "approved": "#9C27B0",
                "suspended": "#F44336"
            }
            
            default_chart_colors = ["#4a6bff", "#ff7043", "#ffca28", "#66bb6a", "#ab47bc"]
            
            settings = DashboardSettings.objects.create(
                version=timezone.now().strftime("%Y-%m-%d"),
                status_colors=default_status_colors,
                chart_colors=default_chart_colors
            )
        
        serializer = self.get_serializer(settings)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def increment_version(self, request):
        """Incrémente le numéro de version des paramètres du dashboard"""
        if not request.user.is_staff:
            return Response({"detail": "Non autorisé"}, status=status.HTTP_403_FORBIDDEN)
            
        settings = DashboardSettings.objects.first()
        
        if not settings:
            return Response({"detail": "Paramètres non trouvés"}, status=status.HTTP_404_NOT_FOUND)
        
        # Obtenir la date actuelle au format ISO (AAAA-MM-JJ)
        current_date = timezone.now().strftime("%Y-%m-%d")
        
        # Vérifier si la version inclut déjà la date actuelle
        if settings.version.startswith(current_date):
            # Extraire le numéro de version et l'incrémenter
            parts = settings.version.split('-v')
            if len(parts) > 1 and parts[1].isdigit():
                version_num = int(parts[1]) + 1
            else:
                version_num = 1
            new_version = f"{current_date}-v{version_num}"
        else:
            # Nouvelle date, commencer à v1
            new_version = f"{current_date}-v1"
        
        settings.version = new_version
        settings.save()
        
        serializer = self.get_serializer(settings)
        return Response(serializer.data)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UniversityViewSet(viewsets.ModelViewSet):
    """API pour gérer les universités"""
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['country']
    search_fields = ['name', 'short_name']
    ordering_fields = ['name', 'country']


class ProductionDataViewSet(viewsets.ModelViewSet):
    """API pour gérer les données de production"""
    queryset = ProductionData.objects.all()
    serializer_class = ProductionDataSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['plant', 'date']
    ordering_fields = ['date', 'production_amount', 'recycling_rate']


class ResearchProjectViewSet(viewsets.ModelViewSet):
    """API pour gérer les projets de recherche"""
    queryset = ResearchProject.objects.all()
    serializer_class = ResearchProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'universities', 'plants']
    search_fields = ['title', 'description']
    ordering_fields = ['start_date', 'title']


class ProductionHistoryView(generics.ListAPIView):
    """API pour obtenir l'historique de production par mois"""
    serializer_class = ProductionHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['plant']
    
    def get_queryset(self):
        """
        Personnalise la requête pour regrouper les données par mois
        """
        # Utilisez la date pour obtenir les données les plus récentes par mois
        from django.db.models import Max
        from django.db.models.functions import TruncMonth
        
        # Regrouper par mois et installation
        queryset = ProductionData.objects.annotate(
            month=TruncMonth('date')
        ).values('plant', 'month').annotate(
            latest_date=Max('date')
        ).order_by('plant', 'month')
        
        # Obtenir les enregistrements correspondant aux dates les plus récentes par mois
        result = []
        for item in queryset:
            data = ProductionData.objects.get(
                plant=item['plant'],
                date=item['latest_date']
            )
            result.append(data)
        
        return result
