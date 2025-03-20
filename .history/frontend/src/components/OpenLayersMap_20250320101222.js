import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, XYZ } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Point } from 'ol/geom';
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';
import Feature from 'ol/Feature';
import Overlay from 'ol/Overlay';
import { defaults as defaultControls, FullScreen, ScaleLine, ZoomSlider, ZoomToExtent } from 'ol/control';
import { Box, Paper, Typography, IconButton, Slider, Tooltip } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import HeightIcon from '@mui/icons-material/Height';
import LayersIcon from '@mui/icons-material/Layers';
import { useSettings } from '../App';
import useTranslation from '../hooks/useTranslation';

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
  
  return value;
};

// Calculer la taille d'un point en fonction de sa production
const calculatePointSize = (production) => {
  if (production < 100) return 5;
  if (production < 1000) return 7;
  if (production < 10000) return 10;
  if (production < 100000) return 15;
  if (production < 1000000) return 20;
  return 25;
};

const OpenLayersMap = ({ plants = [], onResize }) => {
  const { t } = useTranslation();
  const { settings: appSettings } = useSettings() || { settings: {} };
  const [mapHeight, setMapHeight] = useState(800);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHeightSlider, setShowHeightSlider] = useState(false);
  const [mapType, setMapType] = useState('standard'); // standard, satellite, terrain
  
  const mapRef = useRef();
  const mapElement = useRef();
  const popupElement = useRef();
  const popupContentElement = useRef();
  const popupCloserElement = useRef();
  const vectorSourceRef = useRef();
  const overlayRef = useRef();
  
  // Initialiser la carte
  useEffect(() => {
    if (!mapElement.current) return;
    
    // Créer les calques de base
    const standardLayer = new TileLayer({
      source: new OSM(),
      visible: mapType === 'standard',
      preload: Infinity,
      title: 'Standard'
    });
    
    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maxZoom: 19
      }),
      visible: mapType === 'satellite',
      preload: Infinity,
      title: 'Satellite'
    });
    
    const terrainLayer = new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        maxZoom: 19
      }),
      visible: mapType === 'terrain',
      preload: Infinity,
      title: 'Terrain'
    });
    
    // Créer le overlay pour les popups
    const overlay = new Overlay({
      element: popupElement.current,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    overlayRef.current = overlay;
    
    // Gérer la fermeture du popup
    popupCloserElement.current.onclick = function() {
      overlay.setPosition(undefined);
      return false;
    };
    
    // Créer la source de vecteur pour les points
    const vectorSource = new VectorSource({
      features: []
    });
    vectorSourceRef.current = vectorSource;
    
    // Créer le calque de vecteur pour les points
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: function(feature) {
        const production = feature.get('production');
        const status = feature.get('status');
        const color = statusColors[status] || statusColors.default;
        const radius = calculatePointSize(production);
        
        return new Style({
          image: new CircleStyle({
            radius: radius,
            fill: new Fill({
              color: color
            }),
            stroke: new Stroke({
              color: 'white',
              width: 2
            })
          })
        });
      }
    });
    
    // Créer la carte OpenLayers
    const map = new Map({
      target: mapElement.current,
      layers: [standardLayer, satelliteLayer, terrainLayer, vectorLayer],
      overlays: [overlay],
      controls: defaultControls({
        zoom: false,
        rotate: false,
        attribution: true
      }).extend([
        new ScaleLine(),
        new ZoomSlider(),
        new FullScreen()
      ]),
      view: new View({
        center: fromLonLat([-98.5795, 39.8283]), // Centrer sur les USA
        zoom: 4,
        minZoom: 2,
        maxZoom: 19
      })
    });
    
    // Ajouter les points à la carte
    updateFeatures(plants, vectorSource);
    
    // Gérer les clics sur la carte
    map.on('click', function(evt) {
      const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
        return feature;
      });
      
      if (feature) {
        const coordinates = feature.getGeometry().getCoordinates();
        const name = feature.get('name');
        const location = feature.get('location');
        const status = feature.get('status');
        const production = feature.get('production');
        const description = feature.get('description');
        const id = feature.get('id');
        
        // Générer le contenu HTML du popup
        const content = `
          <div style="font-family: Arial, sans-serif; padding: 5px;">
            <h4 style="margin: 0 0 5px 0; font-size: 16px;">${name}</h4>
            <p style="color: #666; margin: 0 0 8px 0; font-size: 12px;">${location}</p>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Statut:</strong> ${status}</p>
            ${production ? `<p style="margin: 5px 0; font-size: 13px;"><strong>Production:</strong> ${production}</p>` : ''}
            ${description ? `<p style="margin: 5px 0; font-size: 13px;"><strong>Description:</strong> ${description}</p>` : ''}
            <div style="margin-top: 10px; text-align: right;">
              <a href="/fonderie/${id}" style="color: #1976d2; text-decoration: none; font-size: 13px;">Plus d'infos</a>
            </div>
          </div>
        `;
        
        popupContentElement.current.innerHTML = content;
        overlay.setPosition(coordinates);
      }
    });
    
    // Changer le curseur au survol
    map.on('pointermove', function(e) {
      const pixel = map.getEventPixel(e.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });
    
    // Enregistrer la référence à la carte
    mapRef.current = map;
    
    // Nettoyer
    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(null);
        mapRef.current = null;
      }
    };
  }, []);
  
  // Mettre à jour le type de carte
  useEffect(() => {
    if (!mapRef.current) return;
    
    const layers = mapRef.current.getLayers().getArray();
    layers.forEach(layer => {
      if (layer instanceof TileLayer) {
        const title = layer.get('title');
        if (title === 'Standard') {
          layer.setVisible(mapType === 'standard');
        } else if (title === 'Satellite') {
          layer.setVisible(mapType === 'satellite');
        } else if (title === 'Terrain') {
          layer.setVisible(mapType === 'terrain');
        }
      }
    });
  }, [mapType]);
  
  // Mettre à jour les points
  useEffect(() => {
    if (vectorSourceRef.current) {
      updateFeatures(plants, vectorSourceRef.current);
    }
  }, [plants]);
  
  // Gérer le redimensionnement
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.updateSize();
      }, 100);
    }
  }, [mapHeight, isFullscreen]);
  
  // Fonction pour mettre à jour les caractéristiques sur la carte
  const updateFeatures = (plants, vectorSource) => {
    // Effacer toutes les caractéristiques existantes
    vectorSource.clear();
    
    // Ajouter les nouvelles caractéristiques
    const features = plants
      .filter(plant => plant.latitude && plant.longitude)
      .map(plant => {
        const production = extractProduction(plant.production || '0');
        const status = plant.status || 'default';
        
        const feature = new Feature({
          geometry: new Point(fromLonLat([parseFloat(plant.longitude), parseFloat(plant.latitude)]))
        });
        
        // Ajouter les propriétés
        feature.setProperties({
          id: plant.id,
          name: plant.name,
          location: plant.location,
          status: status,
          production: production,
          description: plant.processing || '',
          country: plant.country || '',
          website: plant.website || ''
        });
        
        return feature;
      });
    
    vectorSource.addFeatures(features);
  };
  
  // Gérer le changement de hauteur
  const handleChangeHeight = (event, newValue) => {
    setMapHeight(newValue);
    if (onResize) onResize(newValue);
  };
  
  // Gérer le mode plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
              width: 5, 
              height: 5, 
              borderRadius: '50%', 
              backgroundColor: '#666',
              border: '1px solid white',
              mr: 1
            }} 
          />
          <Typography variant="caption">Très faible (&lt; 100)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.7 }}>
          <Box 
            sx={{ 
              width: 7, 
              height: 7, 
              borderRadius: '50%', 
              backgroundColor: '#666',
              border: '1px solid white',
              mr: 1
            }} 
          />
          <Typography variant="caption">Faible (100 - 1 000)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.7 }}>
          <Box 
            sx={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              backgroundColor: '#666',
              border: '1px solid white',
              mr: 1
            }} 
          />
          <Typography variant="caption">Moyenne (1 000 - 10 000)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.7 }}>
          <Box 
            sx={{ 
              width: 15, 
              height: 15, 
              borderRadius: '50%', 
              backgroundColor: '#666',
              border: '1px solid white',
              mr: 1
            }} 
          />
          <Typography variant="caption">Élevée (10 000 - 100 000)</Typography>
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
          <Typography variant="caption">Très élevée (100 000 - 1M)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center'}}>
          <Box 
            sx={{ 
              width: 25, 
              height: 25, 
              borderRadius: '50%', 
              backgroundColor: '#666',
              border: '1px solid white',
              mr: 1
            }} 
          />
          <Typography variant="caption">Massive (&gt; 1M)</Typography>
        </Box>
      </Box>
    </Paper>
  );
  
  return (
    <Box sx={mapContainerStyle}>
      {/* Conteneur de la carte */}
      <div ref={mapElement} style={{ width: '100%', height: '100%' }}>
        {/* Popup pour les informations de points */}
        <div ref={popupElement} className="ol-popup" style={{
          position: 'absolute',
          background: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid #cccccc',
          bottom: '12px',
          left: '-50px',
          minWidth: '200px',
          display: 'none' // Masqué par défaut
        }}>
          <a href="#" ref={popupCloserElement} className="ol-popup-closer" style={{
            textDecoration: 'none',
            position: 'absolute',
            top: '2px',
            right: '8px',
            color: '#666'
          }}>×</a>
          <div ref={popupContentElement}></div>
        </div>
      </div>
      
      {/* Légende de la carte */}
      {appSettings.showLegend !== false && <Legend />}
      
      {/* Contrôles de la carte */}
      <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1 }}>
        <Tooltip title="Changer le style de carte">
          <IconButton 
            onClick={() => {
              // Rotation entre les types de carte
              if (mapType === 'standard') setMapType('satellite');
              else if (mapType === 'satellite') setMapType('terrain');
              else setMapType('standard');
            }}
            sx={{ 
              backgroundColor: 'white', 
              boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
              '&:hover': { backgroundColor: '#f0f0f0' },
              mr: 1
            }}
          >
            <LayersIcon />
          </IconButton>
        </Tooltip>
        
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

export default OpenLayersMap; 