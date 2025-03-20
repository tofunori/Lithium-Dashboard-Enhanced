import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Box, Paper, Typography, IconButton, Slider, Tooltip } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import HeightIcon from '@mui/icons-material/Height';
import { useSettings } from '../App';
import useTranslation from '../hooks/useTranslation';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';

// Statuts et couleurs correspondantes
const statusColors = {
  'Opérationnel': '#00AA00',
  'En construction': '#1976D2',
  'Planifié': '#FFA500',
  'En pause': '#FF0000',
  'Approuvé': '#9C27B0',
  'En suspens': '#FF9800',
  'default': '#999999'
};

// Fonction pour extraire la valeur numérique de la production
const extractProduction = (productionString) => {
  if (!productionString || productionString === 'N/A') return 0;
  
  // Valeur minimum par défaut pour éviter les points de taille zéro
  let value = 5; 
  
  // Cas spécial pour "1 million de VE" ou expressions avec "million"
  if (productionString.toLowerCase().includes('million')) {
    const matches = productionString.match(/(\d+(?:[\.,]\d+)?)[\s]*million/i);
    if (matches && matches[1]) {
      value = parseFloat(matches[1].replace(',', '.')) * 1000000;
    }
  }
  // Cas pour les valeurs en GWh
  else if (productionString.toLowerCase().includes('gwh')) {
    const matches = productionString.match(/(\d+(?:[\s\.,]\d+)?)/);
    if (matches && matches[1]) {
      value = parseFloat(matches[1].replace(/\s/g, '').replace(',', '.')) * 100000;
    }
  }
  // Cas pour les "tonnes par an"
  else if (productionString.toLowerCase().includes('tonne')) {
    const matches = productionString.match(/(\d+(?:[\s\.,]\d+)?)/);
    if (matches && matches[1]) {
      value = parseFloat(matches[1].replace(/\s/g, '').replace(',', '.'));
    }
  }
  // Autres valeurs numériques
  else {
    const matches = productionString.match(/(\d+(?:[\s\.,]\d+)?)/);
    if (matches && matches[1]) {
      // Vérifier les plages comme "10 000-20 000"
      if (matches[1].includes('-')) {
        const range = matches[1].split('-');
        if (range.length === 2) {
          const min = parseFloat(range[0].replace(/\s/g, '').replace(',', '.'));
          const max = parseFloat(range[1].replace(/\s/g, '').replace(',', '.'));
          value = (min + max) / 2;
        }
      } else {
        // Nombre simple
        let numValue = matches[1].replace(/\s/g, '').replace(',', '.');
        // Gérer les "+"
        if (numValue.endsWith('+')) {
          numValue = numValue.substring(0, numValue.length - 1);
          value = parseFloat(numValue) * 1.1;
        } else {
          value = parseFloat(numValue);
        }
      }
    }
  }
  
  console.log(`Production extraite pour "${productionString}": ${value}`);
  return value;
};

// Composant principal de la carte
const MapLibreView = ({ plants = [], onResize }) => {
  const { t } = useTranslation();
  const { settings: appSettings } = useSettings() || { settings: {} };
  const [mapHeight, setMapHeight] = useState(800);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHeightSlider, setShowHeightSlider] = useState(false);
  const [popupInfo, setPopupInfo] = useState(null);
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const popup = useRef(new maplibregl.Popup({ 
    closeButton: true,
    closeOnClick: false,
    maxWidth: '300px'
  }));
  
  // Centrer par défaut sur les États-Unis
  const [viewState, setViewState] = useState({
    longitude: -98.5795,
    latitude: 39.8283,
    zoom: 4
  });
  
  // Transformer les données des installations pour la carte
  const markersData = useMemo(() => {
    if (!plants) return { type: 'FeatureCollection', features: [] };
    
    // Créer les features GeoJSON pour chaque installation
    const features = plants
      .filter(plant => plant.latitude && plant.longitude) // Filtrer les installations sans coordonnées
      .map(plant => {
        // Extraire la production pour déterminer la taille
        const production = extractProduction(plant.production || '0');
        
        // Déterminer la couleur en fonction du statut
        const status = plant.status || 'default';
        const color = statusColors[status] || statusColors.default;
        
        return {
          type: 'Feature',
          properties: {
            id: plant.id,
            name: plant.name,
            location: plant.location,
            status: status,
            production: production,
            color: color,
            description: plant.processing || '',
            country: plant.country || '',
            website: plant.website || '',
            ...plant // Inclure toutes les propriétés pour référence
          },
          geometry: {
            type: 'Point',
            coordinates: [plant.longitude, plant.latitude]
          }
        };
      });
      
    return {
      type: 'FeatureCollection',
      features
    };
  }, [plants]);
  
  // Générer le style de la carte en fonction des paramètres
  const mapStyle = useMemo(() => {
    const style = appSettings.mapStyle || 'standard';
    
    // Utiliser une source de tuiles qui fonctionne bien avec MapLibre
    return {
      version: 8,
      sources: {
        'osm': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };
  }, [appSettings.mapStyle]);
  
  // Effet pour initialiser la carte
  useEffect(() => {
    if (mapInstance.current) return; // La carte est déjà initialisée
    
    // Créer la carte MapLibre avec des options optimisées pour la performance
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      attributionControl: true,
      dragRotate: false, // Désactiver la rotation pour simplifier la navigation
      antialias: true, // Activer l'antialiasing pour un rendu plus fluide
      preserveDrawingBuffer: false, // Améliorer les performances
      maxZoom: 18, // Limiter le zoom maximum
      fadeDuration: 0, // Réduire les effets de transition pour améliorer la performance
      refreshExpiredTiles: false, // Améliorer les performances
      maxBounds: [[-180, -85], [180, 85]], // Limiter l'étendue de la carte
      minZoom: 2 // Limiter le zoom minimum
    });
    
    // Ajouter les contrôles de navigation avec options simplifiées
    map.addControl(new maplibregl.NavigationControl({
      showCompass: false, // Masquer la boussole car la rotation est désactivée
      showZoom: true
    }), 'top-right');
    
    map.addControl(new maplibregl.FullscreenControl(), 'top-right');
    
    // Activer le zoom à la molette avec un comportement plus fluide
    map.scrollZoom.enable();
    map.scrollZoom.setWheelZoomRate(1/450); // Réduire la sensibilité pour un zoom plus fluide
    
    // Gestionnaire d'événements pour le mouvement de la carte
    map.on('moveend', () => {
      setViewState({
        longitude: map.getCenter().lng,
        latitude: map.getCenter().lat,
        zoom: map.getZoom()
      });
    });
    
    // Attendre que la carte soit chargée avant d'ajouter les sources et couches
    map.on('load', () => {
      // Ajouter la source de données
      map.addSource('plants-data', {
        type: 'geojson',
        data: markersData,
        cluster: false, // Désactiver le clustering pour cette source
        generateId: true, // Générer des IDs automatiquement pour améliorer les performances
        tolerance: 0.5 // Simplifier les géométries pour améliorer les performances
      });
      
      // Ajouter la couche de cercles
      map.addLayer({
        id: 'plants',
        type: 'circle',
        source: 'plants-data',
        paint: {
          // Couleur du cercle selon le statut
          'circle-color': ['get', 'color'],
          // Opacité du cercle
          'circle-opacity': 0.8,
          // Taille du cercle selon la production (avec interpolation)
          'circle-radius': [
            'interpolate',
            ['exponential', 1.5], // Utiliser une interpolation exponentielle pour plus de contraste visuel
            ['get', 'production'],
            0, 6,       // Production minimale = 6px
            100, 8,     // Production 100 = 8px
            1000, 12,   // Production 1 000 = 12px
            10000, 16,  // Production 10 000 = 16px
            50000, 22,  // Production 50 000 = 22px
            100000, 28, // Production 100 000 = 28px
            500000, 35, // Production 500 000 = 35px
            1000000, 42 // Production 1 000 000 = 42px
          ],
          // Contour du cercle
          'circle-stroke-width': 2,
          'circle-stroke-color': 'white',
          // Flou du cercle pour un rendu plus doux
          'circle-blur': 0.1
        }
      });
      
      // Clic sur un point de la carte
      map.on('click', 'plants', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const coordinates = feature.geometry.coordinates.slice();
          const properties = feature.properties;
          
          // Créer le contenu HTML pour le popup
          const popupContent = document.createElement('div');
          popupContent.className = 'map-popup-content';
          
          const title = document.createElement('h4');
          title.textContent = properties.name;
          title.style.margin = '0 0 4px 0';
          title.style.fontWeight = 'bold';
          
          const location = document.createElement('p');
          location.textContent = properties.location;
          location.style.color = '#666';
          location.style.fontSize = '0.85rem';
          location.style.margin = '0 0 10px 0';
          
          const statusLabel = document.createElement('p');
          statusLabel.innerHTML = `<strong>${t('status')}:</strong> ${properties.status}`;
          statusLabel.style.margin = '4px 0';
          
          const popupContent2 = document.createElement('div');
          
          if (properties.production > 0) {
            const production = document.createElement('p');
            production.innerHTML = `<strong>Production:</strong> ${properties.originalProduction || `${properties.production} unités`}`;
            production.style.margin = '4px 0';
            popupContent2.appendChild(production);
          }
          
          if (properties.description) {
            const process = document.createElement('p');
            process.innerHTML = `<strong>${t('processing')}:</strong> ${properties.description}`;
            process.style.margin = '4px 0';
            popupContent2.appendChild(process);
          }
          
          const links = document.createElement('div');
          links.style.display = 'flex';
          links.style.justifyContent = 'space-between';
          links.style.marginTop = '12px';
          links.style.paddingTop = '8px';
          links.style.borderTop = '1px solid rgba(0,0,0,0.1)';
          
          if (properties.website) {
            const visit = document.createElement('a');
            visit.href = properties.website;
            visit.textContent = t('visit');
            visit.target = '_blank';
            visit.rel = 'noopener noreferrer';
            visit.style.fontSize = '0.875rem';
            links.appendChild(visit);
          }
          
          const details = document.createElement('a');
          details.href = `/fonderie/${properties.id}`;
          details.textContent = t('more_info');
          details.style.fontSize = '0.875rem';
          details.style.color = '#1976d2';
          details.style.marginLeft = 'auto';
          links.appendChild(details);
          
          popupContent.appendChild(title);
          popupContent.appendChild(location);
          popupContent.appendChild(statusLabel);
          popupContent.appendChild(popupContent2);
          popupContent.appendChild(links);
          
          // Afficher le popup
          popup.current
            .setLngLat(coordinates)
            .setDOMContent(popupContent)
            .addTo(map);
        }
      });
      
      // Changer le curseur au survol des points
      map.on('mouseenter', 'plants', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      
      map.on('mouseleave', 'plants', () => {
        map.getCanvas().style.cursor = '';
      });
    });
    
    // Stocker l'instance de la carte
    mapInstance.current = map;
    
    // Nettoyer la carte au démontage du composant
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [mapStyle, t]); // Réduire les dépendances pour éviter les recreations
  
  // Effet pour mettre à jour les données des points sur la carte
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    
    // Vérifier si la carte est prête et si la source existe
    const updateSource = () => {
      try {
        if (map.isStyleLoaded() && map.getSource('plants-data')) {
          map.getSource('plants-data').setData(markersData);
        } else {
          // Si la source n'est pas encore disponible, réessayer après un délai
          setTimeout(updateSource, 200);
        }
      } catch (err) {
        // Ignorer les erreurs temporaires pendant le chargement de la carte
        setTimeout(updateSource, 200);
      }
    };
    
    updateSource();
  }, [markersData]);
  
  // Gérer le changement de hauteur de la carte
  const handleChangeHeight = (event, newValue) => {
    setMapHeight(newValue);
    if (onResize) onResize(newValue);
    
    // Redimensionner la carte
    if (mapInstance.current) {
      setTimeout(() => {
        mapInstance.current.resize();
      }, 100);
    }
  };
  
  // Gérer le mode plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    
    // Redimensionner la carte après le changement de mode
    setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.resize();
      }
    }, 100);
  };
  
  // Style du conteneur de carte
  const mapContainerStyle = {
    width: '100%', 
    height: `${mapHeight}px`,
    position: 'relative',
    ...(isFullscreen ? {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0
    } : {})
  };
  
  // Composant de légende pour la carte
  const Legend = () => (
    <Paper 
      elevation={2} 
      sx={{ 
        position: 'absolute', 
        bottom: 40, 
        left: 10, 
        zIndex: 1, 
        padding: '10px 14px',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        maxWidth: 220,
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.08)', pb: 0.5 }}>
        Légende
      </Typography>
      
      {/* Légende des statuts */}
      <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 500 }}>Statuts:</Typography>
      {Object.entries(statusColors)
        .filter(([status]) => status !== 'default')
        .map(([status, color]) => (
          <Box key={status} sx={{ display: 'flex', alignItems: 'center', mb: 0.8 }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                backgroundColor: color,
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                mr: 1
              }} 
            />
            <Typography variant="caption">{status}</Typography>
          </Box>
        ))}
      
      {/* Légende de taille */}
      <Typography variant="caption" sx={{ display: 'block', mt: 2, mb: 1, fontWeight: 500 }}>Tailles (production):</Typography>
      <Box sx={{ ml: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.7 }}>
          <Box 
            sx={{ 
              width: 6, 
              height: 6, 
              borderRadius: '50%', 
              backgroundColor: '#666',
              border: '1px solid white',
              mr: 1
            }} 
          />
          <Typography variant="caption">Faible (&lt; 1 000)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.7 }}>
          <Box 
            sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: '#666',
              border: '1px solid white',
              mr: 1
            }} 
          />
          <Typography variant="caption">Moyenne (1 000 - 50 000)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.7 }}>
          <Box 
            sx={{ 
              width: 20, 
              height: 20, 
              borderRadius: '50%', 
              backgroundColor: '#666',
              border: '1px solid white',
              mr: 1
            }} 
          />
          <Typography variant="caption">Élevée (&gt; 50 000)</Typography>
        </Box>
      </Box>
    </Paper>
  );
  
  return (
    <Box sx={mapContainerStyle}>
      {/* Le conteneur de la carte */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {/* Légende de la carte */}
      {appSettings.showLegend !== false && <Legend />}
      
      {/* Contrôles de la carte */}
      <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1 }}>
        <Tooltip title={isFullscreen ? t('exit_fullscreen') : t('fullscreen')}>
          <IconButton 
            onClick={toggleFullscreen}
            sx={{ 
              backgroundColor: 'white', 
              boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
              '&:hover': { backgroundColor: '#f0f0f0' }
            }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title={t('height_label')}>
          <IconButton 
            onClick={() => setShowHeightSlider(!showHeightSlider)}
            sx={{ 
              backgroundColor: 'white', 
              boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
              ml: 1,
              '&:hover': { backgroundColor: '#f0f0f0' }
            }}
          >
            <HeightIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Curseur de hauteur */}
      {showHeightSlider && !isFullscreen && (
        <Paper
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 100,
            width: 200,
            p: 2,
            zIndex: 1
          }}
        >
          <Slider
            min={400}
            max={1200}
            step={50}
            value={mapHeight}
            onChange={handleChangeHeight}
            aria-labelledby="map-height-slider"
            valueLabelDisplay="auto"
          />
        </Paper>
      )}
    </Box>
  );
};

export default MapLibreView; 