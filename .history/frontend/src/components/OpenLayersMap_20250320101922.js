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
  let value = 10; 
  
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
  // Cas pour les valeurs en "kt/an"
  else if (productionString.toLowerCase().includes('kt')) {
    const matches = productionString.match(/(\d+(?:[\s\.,]\d+)?)/);
    if (matches && matches[1]) {
      value = parseFloat(matches[1].replace(/\s/g, '').replace(',', '.')) * 1000;
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
  
  // Assurer une valeur minimum pour la visibilité
  return Math.max(value, 10);
};

// Calculer la taille d'un point en fonction de sa production
const calculatePointSize = (production) => {
  console.log(`Calcul de taille pour production: ${production}`);
  let size;
  
  // Échelle extrêmement contrastée pour maximiser les différences visuelles
  if (production < 100) {
    size = 6;
    console.log(`Production < 100: taille = ${size}`);
  } else if (production < 1000) {
    size = 15;
    console.log(`Production < 1000: taille = ${size}`);
  } else if (production < 10000) {
    size = 25;
    console.log(`Production < 10000: taille = ${size}`);
  } else if (production < 100000) {
    size = 35;
    console.log(`Production < 100000: taille = ${size}`);
  } else if (production < 1000000) {
    size = 45;
    console.log(`Production < 1000000: taille = ${size}`);
  } else {
    size = 60;
    console.log(`Production >= 1000000: taille = ${size}`);
  }
  
  console.log(`Taille finale pour production ${production}: ${size}`);
  return size;
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
    
    // Créer la couche vectorielle avec les points
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        const production = feature.get('production');
        const status = feature.get('status');
        const color = statusColors[status] || statusColors.default;
        const size = calculatePointSize(production);
        
        // Style du point avec bordure plus visible et effet d'ombre
        return new Style({
          image: new CircleStyle({
            radius: size,
            fill: new Fill({
              color: color
            }),
            stroke: new Stroke({
              color: '#FFFFFF',
              width: 2 + (size / 10) // Bordure plus épaisse pour les grands points
            })
          }),
          // Ajouter le nom comme texte
          text: new Text({
            text: feature.get('name'),
            offsetY: -size - 10,
            font: 'bold 12px Arial',
            fill: new Fill({
              color: '#333'
            }),
            stroke: new Stroke({
              color: '#FFF',
              width: 3
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
        const production = feature.get('originalProduction'); // Utiliser la production originale
        const description = feature.get('description');
        const id = feature.get('id');
        const country = feature.get('country');
        const website = feature.get('website');
        
        // Générer le contenu HTML du popup avec un style amélioré
        const content = `
          <div style="font-family: Arial, sans-serif; padding: 5px;">
            <h3 style="margin: 0 0 5px 0; font-size: 18px; color: #1976d2;">${name}</h3>
            <p style="color: #444; margin: 0 0 10px 0; font-size: 13px;">
              <strong>${location}</strong>
              ${country ? ` - ${country}` : ''}
            </p>
            <div style="margin: 10px 0; padding: 8px; background-color: #f5f5f5; border-radius: 4px;">
              <p style="margin: 5px 0; font-size: 13px;">
                <strong>Statut:</strong> 
                <span style="display: inline-block; padding: 2px 6px; border-radius: 3px; background-color: ${statusColors[status] || statusColors.default}; color: white; font-size: 12px; margin-left: 5px;">
                  ${status}
                </span>
              </p>
              ${production ? `<p style="margin: 5px 0; font-size: 13px;"><strong>Production:</strong> ${production}</p>` : ''}
              ${description ? `<p style="margin: 5px 0; font-size: 13px;"><strong>Procédé:</strong> ${description}</p>` : ''}
            </div>
            <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
              ${website ? `<a href="${website}" target="_blank" style="color: #1976d2; text-decoration: none; font-size: 12px;">Site web</a>` : '<span></span>'}
              <a href="/fonderie/${id}" style="display: inline-block; padding: 5px 10px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: bold;">Plus d'infos</a>
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
      // Forcer une mise à jour complète
      console.log("Mise à jour des features sur la carte avec", plants.length, "installations");
      
      // Ajouter un log pour vérifier les valeurs de production
      const values = plants.map(p => p.production);
      console.log("Valeurs de production:", values);
      
      // Mettre à jour les features avec une approche agressive
      updateFeatures(plants, vectorSourceRef.current);
      
      // Forcer un rafraîchissement visuel des couches
      if (mapRef.current) {
        const vectorLayers = mapRef.current.getLayers().getArray()
          .filter(layer => layer instanceof VectorLayer);
        
        vectorLayers.forEach(layer => {
          // Recréer le style pour forcer un nouveau rendu
          const source = layer.getSource();
          const features = source.getFeatures();
          features.forEach(feature => {
            feature.changed();
          });
          
          // Forcer le rafraîchissement de la couche
          layer.changed();
        });
        
        // Forcer la mise à jour de la vue
        mapRef.current.updateSize();
        mapRef.current.render();
      }
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
    
    // Pour déboguer les productions
    const productionValues = plants
      .filter(plant => plant.latitude && plant.longitude)
      .map(plant => {
        const productionStr = plant.production || '0';
        const production = extractProduction(productionStr);
        return {
          name: plant.name,
          original: productionStr,
          extracted: production,
          size: calculatePointSize(production)
        };
      });
    console.table(productionValues);
    
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
          originalProduction: plant.production, // Garder la valeur originale pour l'affichage
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
              width: 7, 
              height: 7, 
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
              width: 12, 
              height: 12, 
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
              width: 18, 
              height: 18, 
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
              width: 25, 
              height: 25, 
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
              width: 35, 
              height: 35, 
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
              width: 45, 
              height: 45, 
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
          minWidth: '200px'
        }}>
          <a href="#" ref={popupCloserElement} className="ol-popup-closer" style={{
            textDecoration: 'none',
            position: 'absolute',
            top: '2px',
            right: '8px',
            color: '#666',
            fontSize: '20px',
            fontWeight: 'bold'
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