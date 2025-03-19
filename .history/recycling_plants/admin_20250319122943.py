from django.contrib import admin
from .models import RecyclingPlant, University, ProductionData, ResearchProject, DashboardSettings

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ['name', 'short_name', 'country']
    search_fields = ['name', 'short_name', 'country']
    list_filter = ['country']

@admin.register(RecyclingPlant)
class RecyclingPlantAdmin(admin.ModelAdmin):
    list_display = ['name', 'university', 'capacity', 'active']
    list_filter = ['active', 'university']
    search_fields = ['name', 'description']
    ordering = ['name']

@admin.register(ProductionData)
class ProductionDataAdmin(admin.ModelAdmin):
    list_display = ['plant', 'date', 'production_amount', 'recycling_rate']
    list_filter = ['plant', 'date']
    date_hierarchy = 'date'

@admin.register(ResearchProject)
class ResearchProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'start_date', 'status']
    list_filter = ['status', 'universities']
    search_fields = ['title', 'description']
    filter_horizontal = ['universities', 'plants']

@admin.register(DashboardSettings)
class DashboardSettingsAdmin(admin.ModelAdmin):
    list_display = ['id', 'last_updated']
