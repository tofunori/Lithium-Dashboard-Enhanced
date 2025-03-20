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
  const [mapType, setMapType] = useState('standard'); // standard, satellite
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
    // Utiliser la préférence de l'utilisateur ou la valeur d'état mapType
    const style = mapType;
    
    // Définir les styles de carte
    if (style === 'satellite') {
      return {
        version: 8,
        sources: {
          'satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Imagery &copy; <a href="https://www.esri.com/">Esri</a>'
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      };
    }
    
    // Style standard par défaut (OpenStreetMap)
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
  }, [mapType]);
  
  // Effet pour initialiser la carte
  useEffect(() => {
    if (mapInstance.current) return; // La carte est déjà initialisée
    
    // Initialiser le popup avant la carte
    if (!popup.current) {
      popup.current = new maplibregl.Popup({ 
        closeButton: true,
        closeOnClick: false,
        maxWidth: '300px'
      });
    }
    
    try {
      console.log("Initialisation de la carte MapLibre");
      
      // Créer la carte MapLibre avec des options optimisées
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
        attributionControl: true,
        dragRotate: false,
        renderWorldCopies: true,
        boxZoom: false,
        fadeDuration: 0,
        optimizeForTerrain: false,
        preserveDrawingBuffer: false,
        refreshExpiredTiles: false,
        maxPitch: 0,
        touchZoomRotate: false,
        logoPosition: 'bottom-left',
        // Paramètres additionnels pour réduire le clignotement
        antialias: true,
        trackResize: true,
        maxParallelImageRequests: 16, // Augmenter le nombre de requêtes parallèles
        transformRequest: (url) => {
          return {
            url,
            headers: {
              'Cache-Control': 'max-age=3600' // Augmenter le cache pour les tuiles
            }
          };
        }
      });
      
      // Précharger les tuiles adjacentes et désactiver la transition pendant le zoom
      map.on('zoom', () => {
        map.getCanvas().style.transition = 'none'; // Désactiver les transitions CSS pendant le zoom
      });
      
      map.on('zoomend', () => {
        map.getCanvas().style.transition = ''; // Réactiver les transitions après le zoom
      });
      
      map.on('sourcedata', () => {
        // Force le rendu quand de nouvelles tuiles sont chargées
        if (map.loaded()) {
          map.triggerRepaint();
        }
      });
      
      // Attendre que la carte soit chargée avant d'ajouter les sources et couches
      map.on('load', () => {
        console.log('Carte chargée');
        
        // Ajouter les contrôles basiques
        map.addControl(new maplibregl.NavigationControl({
          showCompass: false, // Pas de boussole
          visualizePitch: false // Pas d'inclinaison
        }), 'top-right');
        
        // Activer le zoom à la molette avec une vitesse optimisée
        map.scrollZoom.enable();
        map.scrollZoom.setWheelZoomRate(0.05); // Valeur plus faible pour un zoom plus progressif
        
        // Ajouter la source de données pour les points
        map.addSource('plants-data', {
          type: 'geojson',
          data: markersData,
          tolerance: 0.5, // Simplifier les géométries pour de meilleures performances
          buffer: 128,    // Augmenter le buffer pour une meilleure performance pendant le déplacement
          maxzoom: 18,
          generateId: true
        });
        
        // Ajouter les sources des fonds de carte en cache pour améliorer le zoom
        // Ajouter un préchargement de tuiles au démarrage
        setTimeout(() => {
          try {
            // Préchargement des tuiles adjacentes pour une meilleure expérience de zoom
            const bounds = map.getBounds();
            const center = map.getCenter();
            
            // Forcer un rendu pour éviter les flashs
            map.jumpTo({
              center: [center.lng, center.lat],
              zoom: map.getZoom()
            });
          } catch (e) {
            console.warn('Erreur de préchargement', e);
          }
        }, 1000);
        
        // Configuration des modes de rendu pour éviter le clignotement
        map.getCanvas().style.willChange = 'transform';
        map.getCanvas().style.transformStyle = 'preserve-3d';
        map.getCanvas().style.backfaceVisibility = 'hidden';
        
        // Ajouter la couche de cercles pour les points
        // IMPORTANT: Utiliser une approche par catégories pour mieux distinguer les tailles
        map.addLayer({
          id: 'plants',
          type: 'circle',
          source: 'plants-data',
          paint: {
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.9,
            // Taille des points basée sur des catégories discrètes plutôt qu'une interpolation
            'circle-radius': [
              'case',
              ['<', ['get', 'production'], 100], 7,       // Très petit (< 100)
              ['<', ['get', 'production'], 1000], 10,     // Petit (100-1000)
              ['<', ['get', 'production'], 10000], 15,    // Moyen (1k-10k)
              ['<', ['get', 'production'], 100000], 22,   // Grand (10k-100k)
              ['<', ['get', 'production'], 1000000], 30,  // Très grand (100k-1M)
              40                                          // Énorme (> 1M)
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': 'white',
            'circle-stroke-opacity': 0.9
          }
        });
        
        // Afficher des informations sur les productions dans la console
        const productions = markersData.features.map(f => f.properties.production);
        console.log('Productions:', productions);
        console.log('Min:', Math.min(...productions), 'Max:', Math.max(...productions));
        
        // Gestion des clics sur les points
        map.on('click', 'plants', (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const coordinates = feature.geometry.coordinates.slice();
            const properties = feature.properties;
            
            // Contenu simplifié pour le popup
            const html = `
              <div style="font-family: Arial, sans-serif;">
                <h4 style="margin: 0 0 5px 0;">${properties.name}</h4>
                <p style="color: #666; margin: 0 0 10px 0;">${properties.location}</p>
                <p><strong>Statut:</strong> ${properties.status}</p>
                ${properties.production > 0 ? `<p><strong>Production:</strong> ${properties.production}</p>` : ''}
                ${properties.description ? `<p><strong>Description:</strong> ${properties.description}</p>` : ''}
                <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
                  <a href="/fonderie/${properties.id}" style="color: #1976d2; text-decoration: none;">Plus d'infos</a>
                </div>
              </div>
            `;
            
            popup.current
              .setLngLat(coordinates)
              .setHTML(html)
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
        
        // Écouter les changements de vue
        map.on('moveend', () => {
          if (map.getCenter()) {
            setViewState({
              longitude: map.getCenter().lng,
              latitude: map.getCenter().lat,
              zoom: map.getZoom()
            });
          }
        });
      });
      
      // Stocker l'instance de la carte
      mapInstance.current = map;
      
    } catch (error) {
      console.error("Erreur d'initialisation de la carte:", error);
    }
    
    // Nettoyage
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [mapStyle, viewState.longitude, viewState.latitude, viewState.zoom, t, markersData]);
  
  // Effet pour changer le style de la carte quand mapType change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !map.isStyleLoaded()) return;
    
    try {
      // Conserver les coordonnées actuelles de la carte
      const center = map.getCenter();
      const zoom = map.getZoom();
      
      // Changer le style
      map.setStyle(mapStyle);
      
      // Après changement de style, restaurer les couches et sources
      map.once('style.load', () => {
        // Restaurer les coordonnées
        map.setCenter(center);
        map.setZoom(zoom);
        
        // Réajouter la source si nécessaire
        if (!map.getSource('plants-data')) {
          map.addSource('plants-data', {
            type: 'geojson',
            data: markersData
          });
          
          // Réajouter la couche de points
          map.addLayer({
            id: 'plants',
            type: 'circle',
            source: 'plants-data',
            paint: {
              'circle-color': ['get', 'color'],
              'circle-opacity': 0.9,
              'circle-radius': [
                'case',
                ['<', ['get', 'production'], 100], 7,       // Très petit (< 100)
                ['<', ['get', 'production'], 1000], 10,     // Petit (100-1000)
                ['<', ['get', 'production'], 10000], 15,    // Moyen (1k-10k)
                ['<', ['get', 'production'], 100000], 22,   // Grand (10k-100k)
                ['<', ['get', 'production'], 1000000], 30,  // Très grand (100k-1M)
                40                                          // Énorme (> 1M)
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': 'white',
              'circle-stroke-opacity': 0.9
            }
          });
        }
      });
    } catch (err) {
      console.error("Erreur lors du changement de style de carte:", err);
    }
  }, [mapType, mapStyle]);
  
  // Effet pour mettre à jour les données des points sur la carte
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    
    const updateData = () => {
      if (!map.isStyleLoaded()) {
        // Attendre que la carte soit chargée
        setTimeout(updateData, 100);
        return;
      }
      
      try {
        const source = map.getSource('plants-data');
        if (source) {
          source.setData(markersData);
        }
      } catch (err) {
        console.warn('Impossible de mettre à jour les données, réessai...', err);
        // Réessayer en cas d'erreur
        setTimeout(updateData, 200);
      }
    };
    
    updateData();
  }, [markersData]);
  
  // Gérer le changement de hauteur de la carte
  const handleChangeHeight = (event, newValue) => {
    setMapHeight(newValue);
    if (onResize) onResize(newValue);
    
    // Redimensionner la carte de façon sécurisée
    setTimeout(() => {
      try {
        if (mapInstance.current) {
          mapInstance.current.resize();
        }
      } catch (err) {
        console.warn('Erreur lors du redimensionnement', err);
      }
    }, 100);
  };
  
  // Gérer le mode plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    
    // Redimensionner la carte après le changement de mode
    setTimeout(() => {
      try {
        if (mapInstance.current) {
          mapInstance.current.resize();
        }
      } catch (err) {
        console.warn('Erreur lors du passage en plein écran', err);
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
        <Tooltip title={mapType === 'standard' ? 'Passer en mode satellite' : 'Passer en mode standard'}>
          <IconButton 
            onClick={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
            sx={{ 
              backgroundColor: 'white', 
              boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
              '&:hover': { backgroundColor: '#f0f0f0' },
              mr: 1
            }}
          >
            {mapType === 'standard' ? (
              <Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden' }}>
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/3209/3209976.png" 
                  alt="Satellite"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            ) : (
              <Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden' }}>
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/854/854878.png" 
                  alt="Standard"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            )}
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

export default MapLibreView; 