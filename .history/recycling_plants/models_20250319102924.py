from django.db import models
from django.utils.translation import gettext_lazy as _

class RecyclingPlant(models.Model):
    """Modèle représentant une installation de recyclage de batteries"""
    
    STATUS_CHOICES = [
        ('operational', _('Opérationnel')),
        ('construction', _('En construction')),
        ('planned', _('Planifié')),
        ('approved', _('Approuvé')),
        ('suspended', _('En pause')),
    ]
    
    COUNTRY_CHOICES = [
        ('Canada', _('Canada')),
        ('USA', _('États-Unis')),
        ('Mexico', _('Mexique')),
    ]
    
    name = models.CharField(_('Nom'), max_length=100)
    location = models.CharField(_('Emplacement'), max_length=200)
    country = models.CharField(_('Pays'), max_length=50, choices=COUNTRY_CHOICES)
    latitude = models.FloatField(_('Latitude'))
    longitude = models.FloatField(_('Longitude'))
    status = models.CharField(_('Statut'), max_length=20, choices=STATUS_CHOICES)
    production = models.CharField(_('Production'), max_length=200, blank=True, null=True)
    processing = models.CharField(_('Technologie'), max_length=200, blank=True, null=True)
    notes = models.TextField(_('Notes'), blank=True, null=True)
    website = models.URLField(_('Site web'), blank=True, null=True)
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)
    
    class Meta:
        verbose_name = _('Installation de recyclage')
        verbose_name_plural = _('Installations de recyclage')
        ordering = ['country', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.location}"
    
    @property
    def coordinates(self):
        """Retourne les coordonnées sous forme [lat, lng] pour la compatibilité API"""
        return [self.latitude, self.longitude]


class DashboardSettings(models.Model):
    """Modèle pour stocker les paramètres du dashboard"""
    version = models.CharField(_('Version'), max_length=20)
    last_updated = models.DateTimeField(_('Dernière mise à jour'), auto_now=True)
    status_colors = models.JSONField(_('Couleurs des statuts'), default=dict)
    chart_colors = models.JSONField(_('Couleurs des graphiques'), default=list)
    
    class Meta:
        verbose_name = _('Paramètres du dashboard')
        verbose_name_plural = _('Paramètres du dashboard')
    
    def __str__(self):
        return f"Paramètres dashboard v{self.version}"
