from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Refinery, DashboardSettings

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class RefinerySerializer(serializers.ModelSerializer):
    coordinates = serializers.SerializerMethodField()
    
    class Meta:
        model = Refinery
        fields = (
            'id', 'name', 'location', 'country', 'coordinates', 'status',
            'production', 'processing', 'notes', 'website', 'created_at', 'updated_at'
        )
    
    def get_coordinates(self, obj):
        return [obj.latitude, obj.longitude]
    
    def create(self, validated_data):
        # Remove coordinates if present in incoming data as it's a computed property
        validated_data.pop('coordinates', None)
        return super().create(validated_data)


class RefineryCreateUpdateSerializer(serializers.ModelSerializer):
    coordinates = serializers.ListField(
        child=serializers.FloatField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Refinery
        fields = (
            'id', 'name', 'location', 'country', 'coordinates', 'status',
            'production', 'processing', 'notes', 'website'
        )
    
    def create(self, validated_data):
        coordinates = validated_data.pop('coordinates', [0, 0])
        if coordinates and len(coordinates) == 2:
            validated_data['latitude'] = coordinates[0]
            validated_data['longitude'] = coordinates[1]
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        coordinates = validated_data.pop('coordinates', None)
        if coordinates and len(coordinates) == 2:
            validated_data['latitude'] = coordinates[0]
            validated_data['longitude'] = coordinates[1]
        return super().update(instance, validated_data)


class DashboardSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardSettings
        fields = ('id', 'version', 'last_updated', 'status_colors', 'chart_colors')