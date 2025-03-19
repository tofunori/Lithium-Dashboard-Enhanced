from django.contrib import admin
from .models import RecyclingPlant, DashboardSettings

@admin.register(RecyclingPlant)
class RecyclingPlantAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'country', 'status', 'production')
    list_filter = ('country', 'status')
    search_fields = ('name', 'location')
    ordering = ('country', 'name')

@admin.register(DashboardSettings)
class DashboardSettingsAdmin(admin.ModelAdmin):
    list_display = ('version', 'last_updated')
    readonly_fields = ('last_updated',)
