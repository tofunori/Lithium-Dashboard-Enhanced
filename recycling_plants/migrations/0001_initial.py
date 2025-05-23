# Generated by Django 5.1.7 on 2025-03-19 14:32

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='DashboardSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('version', models.CharField(max_length=20, verbose_name='Version')),
                ('last_updated', models.DateTimeField(auto_now=True, verbose_name='Dernière mise à jour')),
                ('status_colors', models.JSONField(default=dict, verbose_name='Couleurs des statuts')),
                ('chart_colors', models.JSONField(default=list, verbose_name='Couleurs des graphiques')),
            ],
            options={
                'verbose_name': 'Paramètres du dashboard',
                'verbose_name_plural': 'Paramètres du dashboard',
            },
        ),
        migrations.CreateModel(
            name='RecyclingPlant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Nom')),
                ('location', models.CharField(max_length=200, verbose_name='Emplacement')),
                ('country', models.CharField(choices=[('Canada', 'Canada'), ('USA', 'États-Unis'), ('Mexico', 'Mexique')], max_length=50, verbose_name='Pays')),
                ('latitude', models.FloatField(verbose_name='Latitude')),
                ('longitude', models.FloatField(verbose_name='Longitude')),
                ('status', models.CharField(choices=[('operational', 'Opérationnel'), ('construction', 'En construction'), ('planned', 'Planifié'), ('approved', 'Approuvé'), ('suspended', 'En pause')], max_length=20, verbose_name='Statut')),
                ('production', models.CharField(blank=True, max_length=200, null=True, verbose_name='Production')),
                ('processing', models.CharField(blank=True, max_length=200, null=True, verbose_name='Technologie')),
                ('notes', models.TextField(blank=True, null=True, verbose_name='Notes')),
                ('website', models.URLField(blank=True, null=True, verbose_name='Site web')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Créé le')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Mis à jour le')),
            ],
            options={
                'verbose_name': 'Installation de recyclage',
                'verbose_name_plural': 'Installations de recyclage',
                'ordering': ['country', 'name'],
            },
        ),
    ]
