from rest_framework import serializers
from django.contrib.auth.models import User
from .models import RecyclingPlant, DashboardSettings, University, ProductionData, ResearchProject

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = '__all__'

class RecyclingPlantSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source='university.name', read_only=True)
    
    class Meta:
        model = RecyclingPlant
        fields = [
            'id', 'name', 'university', 'university_name', 'capacity', 
            'latitude', 'longitude', 'address', 'active', 
            'opening_date', 'description'
        ]

class ProductionDataSerializer(serializers.ModelSerializer):
    plant_name = serializers.CharField(source='plant.name', read_only=True)
    
    class Meta:
        model = ProductionData
        fields = [
            'id', 'plant', 'plant_name', 'date', 
            'production_amount', 'recycling_rate', 'waste_amount', 
            'notes'
        ]

class ResearchProjectSerializer(serializers.ModelSerializer):
    universities_details = UniversitySerializer(source='universities', many=True, read_only=True)
    plants_details = RecyclingPlantSerializer(source='plants', many=True, read_only=True)
    
    class Meta:
        model = ResearchProject
        fields = [
            'id', 'title', 'description', 'start_date', 'end_date', 
            'status', 'universities', 'universities_details', 
            'plants', 'plants_details'
        ]

# Serializers spécifiques pour le dashboard avec des données agrégées
class PlantSummarySerializer(serializers.ModelSerializer):
    current_production = serializers.SerializerMethodField()
    recycling_rate = serializers.SerializerMethodField()
    university_name = serializers.CharField(source='university.name', read_only=True)
    
    class Meta:
        model = RecyclingPlant
        fields = [
            'id', 'name', 'university_name', 'capacity', 
            'latitude', 'longitude', 'active', 
            'current_production', 'recycling_rate'
        ]
    
    def get_current_production(self, obj):
        """Récupère la production la plus récente"""
        latest_data = obj.production_data.order_by('-date').first()
        return latest_data.production_amount if latest_data else 0
    
    def get_recycling_rate(self, obj):
        """Récupère le taux de recyclage le plus récent"""
        latest_data = obj.production_data.order_by('-date').first()
        return latest_data.recycling_rate if latest_data else 0

class ProductionHistorySerializer(serializers.ModelSerializer):
    """Serializer pour les données historiques de production"""
    plant_name = serializers.CharField(source='plant.name')
    month = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductionData
        fields = ['plant_name', 'plant', 'month', 'production_amount', 'recycling_rate']
    
    def get_month(self, obj):
        return obj.date.strftime('%Y-%m')

class RecyclingPlantCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecyclingPlant
        fields = [
            'name', 'location', 'country', 'latitude', 'longitude', 
            'status', 'production', 'processing', 'notes', 'website'
        ]

class DashboardSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardSettings
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff'] 