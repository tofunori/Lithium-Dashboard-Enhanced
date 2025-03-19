from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator

class University(models.Model):
    """Modèle pour représenter les universités collaboratrices"""
    name = models.CharField(max_length=200, verbose_name="Nom de l'université")
    short_name = models.CharField(max_length=20, verbose_name="Acronyme")
    country = models.CharField(max_length=100, verbose_name="Pays")
    website = models.URLField(blank=True, verbose_name="Site web")
    description = models.TextField(blank=True, verbose_name="Description")
    
    class Meta:
        verbose_name = "Université"
        verbose_name_plural = "Universités"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class RecyclingPlant(models.Model):
    """Modèle pour les installations de recyclage de lithium"""
    name = models.CharField(max_length=200, verbose_name="Nom de l'installation")
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name="plants", verbose_name="Université")
    capacity = models.FloatField(default=1000, validators=[MinValueValidator(0)], verbose_name="Capacité (kg/mois)")
    latitude = models.FloatField(blank=True, null=True, verbose_name="Latitude")
    longitude = models.FloatField(blank=True, null=True, verbose_name="Longitude")
    address = models.CharField(max_length=255, blank=True, verbose_name="Adresse")
    active = models.BooleanField(default=True, verbose_name="Active")
    opening_date = models.DateField(blank=True, null=True, verbose_name="Date d'ouverture")
    description = models.TextField(blank=True, verbose_name="Description")
    
    class Meta:
        verbose_name = "Installation de recyclage"
        verbose_name_plural = "Installations de recyclage"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class ProductionData(models.Model):
    """Modèle pour enregistrer les données de production mensuelle"""
    plant = models.ForeignKey(RecyclingPlant, on_delete=models.CASCADE, related_name="production_data", verbose_name="Installation")
    date = models.DateField(verbose_name="Date")
    production_amount = models.FloatField(validators=[MinValueValidator(0)], verbose_name="Production (kg)")
    recycling_rate = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)], 
        verbose_name="Taux de recyclage (%)"
    )
    waste_amount = models.FloatField(validators=[MinValueValidator(0)], verbose_name="Déchets (kg)")
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    class Meta:
        verbose_name = "Donnée de production"
        verbose_name_plural = "Données de production"
        ordering = ['-date', 'plant']
        unique_together = ['plant', 'date']  # Une entrée par mois par installation
    
    def __str__(self):
        return f"{self.plant.name} - {self.date}"

class ResearchProject(models.Model):
    """Modèle pour représenter les projets de recherche collaboratifs"""
    title = models.CharField(max_length=255, verbose_name="Titre du projet")
    description = models.TextField(verbose_name="Description")
    start_date = models.DateField(verbose_name="Date de début")
    end_date = models.DateField(blank=True, null=True, verbose_name="Date de fin")
    universities = models.ManyToManyField(University, related_name="research_projects", verbose_name="Universités participantes")
    plants = models.ManyToManyField(RecyclingPlant, blank=True, related_name="research_projects", verbose_name="Installations associées")
    status = models.CharField(
        max_length=20,
        choices=[
            ('planning', 'En planification'),
            ('active', 'Actif'),
            ('completed', 'Terminé'),
            ('suspended', 'Suspendu'),
        ],
        default='planning',
        verbose_name="Statut"
    )
    
    class Meta:
        verbose_name = "Projet de recherche"
        verbose_name_plural = "Projets de recherche"
        ordering = ['-start_date', 'title']
    
    def __str__(self):
        return self.title

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
