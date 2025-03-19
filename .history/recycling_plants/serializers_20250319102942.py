from rest_framework import serializers
from django.contrib.auth.models import User
from .models import RecyclingPlant, DashboardSettings

class RecyclingPlantSerializer(serializers.ModelSerializer):
    coordinates = serializers.SerializerMethodField()
    
    class Meta:
        model = RecyclingPlant
        fields = '__all__'
    
    def get_coordinates(self, obj):
        return obj.coordinates

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