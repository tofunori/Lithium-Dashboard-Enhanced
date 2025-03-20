import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Map, { 
  Source, 
  Layer, 
  Popup, 
  NavigationControl, 
  FullscreenControl 
} from 'react-map-gl/dist/esm/index.js';
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
  
  // Configuration des styles de points et cercles
  const circleLayer = {
    id: 'plants',
    type: 'circle',
    paint: {
      // Couleur du cercle selon le statut
      'circle-color': ['get', 'color'],
      // Opacité du cercle
      'circle-opacity': 0.8,
      // Taille du cercle selon la production (avec interpolation)
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'production'],
        0, 6,       // Production minimale = 6px
        100, 8,     // Production 100 = 8px
        1000, 10,   // Production 1 000 = 10px
        5000, 12,   // Production 5 000 = 12px 
        10000, 14,  // Production 10 000 = 14px
        50000, 18,  // Production 50 000 = 18px
        100000, 22, // Production 100 000 = 22px
        500000, 28, // Production 500 000 = 28px
        1000000, 34 // Production 1 000 000 = 34px
      ],
      // Contour du cercle
      'circle-stroke-width': 2,
      'circle-stroke-color': 'white'
    }
  };
  
  // Gérer le clic sur un point pour ouvrir le popup
  const onClick = useCallback(event => {
    const { features } = event;
    
    // Vérifier si un point a été cliqué
    const clickedPoint = features && features.length > 0 ? features[0] : null;
    
    if (clickedPoint) {
      // Si un point est cliqué, définir les infos pour le popup
      setPopupInfo({
        longitude: clickedPoint.geometry.coordinates[0],
        latitude: clickedPoint.geometry.coordinates[1],
        properties: clickedPoint.properties
      });
    }
  }, []);
  
  // Gérer le changement de hauteur de la carte
  const handleChangeHeight = (event, newValue) => {
    setMapHeight(newValue);
    if (onResize) onResize(newValue);
  };
  
  // Gérer le mode plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Générer le style de la carte en fonction des paramètres
  const mapStyle = useMemo(() => {
    const style = appSettings.mapStyle || 'standard';
    
    // Styles de carte prédéfinis
    if (style === 'satellite') {
      return 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_key';
    } else if (style === 'terrain') {
      return 'https://api.maptiler.com/maps/outdoor/style.json?key=get_your_own_key';
    }
    // Style standard par défaut (OpenStreetMap)
    return {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap Contributors'
        }
      },
      layers: [
        {
          id: 'osm-tiles',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };
  }, [appSettings.mapStyle]);
  
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
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={mapStyle}
        interactiveLayerIds={['plants']}
        onClick={onClick}
        style={{ width: '100%', height: '100%' }}
        attributionControl={true}
        mapLib={maplibregl}
      >
        {/* Ajouter les contrôles de navigation */}
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        
        {/* Source des données pour les points */}
        <Source id="plants-data" type="geojson" data={markersData}>
          <Layer {...circleLayer} />
        </Source>
        
        {/* Popup d'information */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            closeOnClick={false}
            onClose={() => setPopupInfo(null)}
            maxWidth="300px"
          >
            <Box sx={{ p: 0.5 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {popupInfo.properties.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {popupInfo.properties.location}
              </Typography>
              
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>{t('status')}:</strong> {popupInfo.properties.status}
              </Typography>
              
              {popupInfo.properties.production > 0 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Production:</strong> {popupInfo.properties.originalProduction || `${popupInfo.properties.production} unités`}
                </Typography>
              )}
              
              {popupInfo.properties.description && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>{t('processing')}:</strong> {popupInfo.properties.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                {popupInfo.properties.website && (
                  <Link href={popupInfo.properties.website} target="_blank" rel="noopener noreferrer" sx={{ fontSize: '0.875rem' }}>
                    {t('visit')}
                  </Link>
                )}
                
                <Link 
                  component={RouterLink} 
                  to={`/fonderie/${popupInfo.properties.id}`} 
                  color="primary"
                  sx={{ fontSize: '0.875rem', ml: 'auto' }}
                >
                  {t('more_info')}
                </Link>
              </Box>
            </Box>
          </Popup>
        )}
        
        {/* Légende de la carte */}
        {appSettings.showLegend !== false && <Legend />}
      </Map>
      
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