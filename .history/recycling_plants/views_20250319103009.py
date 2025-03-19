from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import RecyclingPlant, DashboardSettings
from .serializers import RecyclingPlantSerializer, RecyclingPlantCreateUpdateSerializer, DashboardSettingsSerializer, UserSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    """Autoriser l'accès en lecture à tous, mais accès en écriture uniquement aux administrateurs"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class RecyclingPlantViewSet(viewsets.ModelViewSet):
    queryset = RecyclingPlant.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return RecyclingPlantCreateUpdateSerializer
        return RecyclingPlantSerializer
    
    def get_queryset(self):
        queryset = RecyclingPlant.objects.all()
        
        # Filtrer par pays
        country = self.request.query_params.get('country', None)
        if country and country != 'all':
            queryset = queryset.filter(country=country)
            
        # Filtrer par statut
        status = self.request.query_params.get('status', None)
        if status and status != 'all':
            queryset = queryset.filter(status=status)
            
        # Filtrer par capacité minimale (à implémenter si nécessaire)
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Retourne des statistiques agrégées sur les installations"""
        total_count = RecyclingPlant.objects.count()
        operational_count = RecyclingPlant.objects.filter(status='operational').count()
        construction_count = RecyclingPlant.objects.filter(status='construction').count()
        
        # Calculer la capacité totale (à améliorer avec des champs numériques)
        capacity_sum = 0
        for plant in RecyclingPlant.objects.all():
            if plant.production:
                # Extraire les chiffres de la chaîne production
                import re
                match = re.search(r'(\d+)', plant.production)
                if match:
                    capacity_sum += int(match.group(1))
        
        return Response({
            'total_refineries': total_count,
            'operational_refineries': operational_count,
            'construction_refineries': construction_count,
            'total_capacity': str(capacity_sum)
        })


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
