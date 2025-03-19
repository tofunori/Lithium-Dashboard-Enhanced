from django.contrib import admin
from .models import Refinery, DashboardSettings

@admin.register(Refinery)
class RefineryAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'country', 'status', 'updated_at')
    list_filter = ('country', 'status')
    search_fields = ('name', 'location')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('name', 'location', 'country')
        }),
        ('Coordinates', {
            'fields': ('latitude', 'longitude')
        }),
        ('Details', {
            'fields': ('status', 'production', 'processing', 'notes', 'website')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(DashboardSettings)
class DashboardSettingsAdmin(admin.ModelAdmin):
    list_display = ('version', 'last_updated')
    readonly_fields = ('last_updated',)