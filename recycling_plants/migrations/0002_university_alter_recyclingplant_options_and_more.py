# Generated by Django 5.1.7 on 2025-03-19 16:32

import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recycling_plants', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='University',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name="Nom de l'université")),
                ('short_name', models.CharField(max_length=20, verbose_name='Acronyme')),
                ('country', models.CharField(max_length=100, verbose_name='Pays')),
                ('website', models.URLField(blank=True, verbose_name='Site web')),
                ('description', models.TextField(blank=True, verbose_name='Description')),
            ],
            options={
                'verbose_name': 'Université',
                'verbose_name_plural': 'Universités',
                'ordering': ['name'],
            },
        ),
        migrations.AlterModelOptions(
            name='recyclingplant',
            options={'ordering': ['name'], 'verbose_name': 'Installation de recyclage', 'verbose_name_plural': 'Installations de recyclage'},
        ),
        migrations.RemoveField(
            model_name='recyclingplant',
            name='country',
        ),
        migrations.RemoveField(
            model_name='recyclingplant',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='recyclingplant',
            name='location',
        ),
        migrations.RemoveField(
            model_name='recyclingplant',
            name='notes',
        ),
        migrations.RemoveField(
            model_name='recyclingplant',
            name='processing',
        ),
        migrations.RemoveField(
            model_name='recyclingplant',
            name='production',
        ),
        migrations.RemoveField(
            model_name='recyclingplant',
            name='status',
        ),
        migrations.RemoveField(
            model_name='recyclingplant',
            name='updated_at',
        ),
        migrations.RemoveField(
            model_name='recyclingplant',
            name='website',
        ),
        migrations.AddField(
            model_name='recyclingplant',
            name='active',
            field=models.BooleanField(default=True, verbose_name='Active'),
        ),
        migrations.AddField(
            model_name='recyclingplant',
            name='address',
            field=models.CharField(blank=True, max_length=255, verbose_name='Adresse'),
        ),
        migrations.AddField(
            model_name='recyclingplant',
            name='capacity',
            field=models.FloatField(default=1000, validators=[django.core.validators.MinValueValidator(0)], verbose_name='Capacité (kg/mois)'),
        ),
        migrations.AddField(
            model_name='recyclingplant',
            name='description',
            field=models.TextField(blank=True, verbose_name='Description'),
        ),
        migrations.AddField(
            model_name='recyclingplant',
            name='opening_date',
            field=models.DateField(blank=True, null=True, verbose_name="Date d'ouverture"),
        ),
        migrations.AlterField(
            model_name='recyclingplant',
            name='latitude',
            field=models.FloatField(blank=True, null=True, verbose_name='Latitude'),
        ),
        migrations.AlterField(
            model_name='recyclingplant',
            name='longitude',
            field=models.FloatField(blank=True, null=True, verbose_name='Longitude'),
        ),
        migrations.AlterField(
            model_name='recyclingplant',
            name='name',
            field=models.CharField(max_length=200, verbose_name="Nom de l'installation"),
        ),
        migrations.CreateModel(
            name='ResearchProject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255, verbose_name='Titre du projet')),
                ('description', models.TextField(verbose_name='Description')),
                ('start_date', models.DateField(verbose_name='Date de début')),
                ('end_date', models.DateField(blank=True, null=True, verbose_name='Date de fin')),
                ('status', models.CharField(choices=[('planning', 'En planification'), ('active', 'Actif'), ('completed', 'Terminé'), ('suspended', 'Suspendu')], default='planning', max_length=20, verbose_name='Statut')),
                ('plants', models.ManyToManyField(blank=True, related_name='research_projects', to='recycling_plants.recyclingplant', verbose_name='Installations associées')),
                ('universities', models.ManyToManyField(related_name='research_projects', to='recycling_plants.university', verbose_name='Universités participantes')),
            ],
            options={
                'verbose_name': 'Projet de recherche',
                'verbose_name_plural': 'Projets de recherche',
                'ordering': ['-start_date', 'title'],
            },
        ),
        migrations.AddField(
            model_name='recyclingplant',
            name='university',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='plants', to='recycling_plants.university', verbose_name='Université'),
        ),
        migrations.CreateModel(
            name='ProductionData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(verbose_name='Date')),
                ('production_amount', models.FloatField(validators=[django.core.validators.MinValueValidator(0)], verbose_name='Production (kg)')),
                ('recycling_rate', models.FloatField(validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)], verbose_name='Taux de recyclage (%)')),
                ('waste_amount', models.FloatField(validators=[django.core.validators.MinValueValidator(0)], verbose_name='Déchets (kg)')),
                ('notes', models.TextField(blank=True, verbose_name='Notes')),
                ('plant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='production_data', to='recycling_plants.recyclingplant', verbose_name='Installation')),
            ],
            options={
                'verbose_name': 'Donnée de production',
                'verbose_name_plural': 'Données de production',
                'ordering': ['-date', 'plant'],
                'unique_together': {('plant', 'date')},
            },
        ),
    ]
