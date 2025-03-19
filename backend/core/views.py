from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import Refinery, DashboardSettings
from .serializers import RefinerySerializer, RefineryCreateUpdateSerializer, DashboardSettingsSerializer, UserSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow read access to everyone, but write access only to admins"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class RefineryViewSet(viewsets.ModelViewSet):
    queryset = Refinery.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return RefineryCreateUpdateSerializer
        return RefinerySerializer
    
    def get_queryset(self):
        queryset = Refinery.objects.all()
        
        # Filter by country
        country = self.request.query_params.get('country', None)
        if country and country != 'all':
            queryset = queryset.filter(country=country)
            
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status and status != 'all':
            queryset = queryset.filter(status=status)
            
        # Filter by minimum capacity (needs parsing from production string)
        min_capacity = self.request.query_params.get('min_capacity', None)
        if min_capacity and min_capacity.isdigit() and int(min_capacity) > 0:
            # This is a simplified approach - in production you'd want a more robust solution
            # potentially with a separate numeric field for capacity
            pass
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Return aggregated statistics about refineries"""
        total_count = Refinery.objects.count()
        operational_count = Refinery.objects.filter(status='operational').count()
        construction_count = Refinery.objects.filter(status='construction').count()
        
        # In a real implementation, you'd calculate total capacity from numeric fields
        # This is a placeholder
        total_capacity = "18300"
        
        return Response({
            'total_refineries': total_count,
            'operational_refineries': operational_count,
            'construction_refineries': construction_count,
            'total_capacity': total_capacity
        })


class DashboardSettingsViewSet(viewsets.ModelViewSet):
    queryset = DashboardSettings.objects.all()
    serializer_class = DashboardSettingsSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current dashboard settings or create default if none exist"""
        settings = DashboardSettings.objects.first()
        
        if not settings:
            # Create default settings
            default_status_colors = {
                "operational": "#00AA00",
                "construction": "#0000FF",
                "planned": "#FFA500",
                "approved": "#FFA500",
                "suspended": "#FF0000"
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
        """Increment the version number of the dashboard settings"""
        if not request.user.is_staff:
            return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
            
        settings = DashboardSettings.objects.first()
        
        if not settings:
            return Response({"detail": "No settings found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get current date in ISO format (YYYY-MM-DD)
        current_date = timezone.now().strftime("%Y-%m-%d")
        
        # Check if version already includes current date
        if settings.version.startswith(current_date):
            # Extract version number and increment
            parts = settings.version.split('-v')
            if len(parts) > 1 and parts[1].isdigit():
                version_num = int(parts[1]) + 1
            else:
                version_num = 1
            new_version = f"{current_date}-v{version_num}"
        else:
            # New date, start at v1
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