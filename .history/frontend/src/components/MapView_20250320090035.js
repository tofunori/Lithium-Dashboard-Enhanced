import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Box, Paper, Typography, IconButton, Slider, Tooltip } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import HeightIcon from '@mui/icons-material/Height';
// Suppression temporaire de MarkerClusterGroup
// import MarkerClusterGroup from 'react-leaflet-cluster';
import { useSettings } from '../App';
import useTranslation from '../hooks/useTranslation';
import { Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Correction pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Définir des icônes personnalisées selon le statut
const createCustomIcon = (color, size = 1) => {
  // Taille de base
  const baseWidth = 25;
  const baseHeight = 41;
  
  // Calculer la nouvelle taille en fonction du facteur size
  // Permettre une plus grande plage de tailles (min 15px, max 50px de largeur)
  const width = Math.max(15, Math.min(50, baseWidth * size));
  const height = Math.max(24, Math.min(82, baseHeight * size));
  
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [width, height],
    iconAnchor: [width/2, height],
    popupAnchor: [1, -height+7],
    shadowSize: [width*1.5, height]
  });
};

// Mapper les statuts aux couleurs d'icônes
const statusToColor = {
  Opérationnel: 'green',
  'En construction': 'blue',
  'En pause': 'red',
  Planifié: 'orange',
  Approuvé: 'violet',
  'En suspens': 'red',
  default: 'grey'
};

// Traduire les statuts en français pour l'affichage
const statusTranslation = {
  operational: 'Opérationnel',
  construction: 'En construction',
  planned: 'Planifié',
  approved: 'Approuvé',
  suspended: 'En pause',
  default: 'Inconnu'
};

// Composant de légende
const MapLegend = () => {
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        position: 'absolute', 
        bottom: 10, 
        left: 10, 
        zIndex: 1000, 
        padding: '10px 14px',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        maxWidth: 200,
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.08)', pb: 0.5 }}>
        Légende
      </Typography>
      {Object.entries(statusTranslation).filter(([key]) => key !== 'default').map(([status, label]) => (
        <Box key={status} sx={{ display: 'flex', alignItems: 'center', mb: 0.8 }}>
          <Box 
            sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: statusToColor[status],
              mr: 1.5,
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }} 
          />
          <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>{label}</Typography>
        </Box>
      ))}
      
      <Typography variant="subtitle2" sx={{ fontWeight: 500, mt: 2, mb: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.08)', pb: 0.5 }}>
        Taille des points
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '0.8rem', display: 'block', mb: 1 }}>
        La taille des points varie selon la production annuelle de chaque raffinerie.
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: 'grey',
              mr: 0.5,
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }} 
          />
          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Petite</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: 'grey',
              mr: 0.5,
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }} 
          />
          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Moyenne</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 16, 
              height: 16, 
              borderRadius: '50%', 
              backgroundColor: 'grey',
              mr: 0.5,
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }} 
          />
          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Grande</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

// Composant pour les marqueurs de la carte
const MapMarkers = ({ plants, settings }) => {
  const { t } = useTranslation();
  
  // Utiliser des paramètres sécurisés si settings n'est pas fourni
  const safeSettings = settings || { markerClustering: false };
  
  // Vérifier que plants existe avant de filtrer
  const validPlants = plants && plants.length > 0 
    ? plants.filter(plant => plant.latitude && plant.longitude)
    : [];

  // Fonction pour extraire la valeur numérique de la production
  const extractProduction = (productionString) => {
    if (!productionString || productionString === 'N/A') return 0;
    
    // Cas spécial pour "1 million de VE"
    if (productionString.includes('million')) {
      const matches = productionString.match(/(\d+)[\s]*million/i);
      if (matches && matches[1]) {
        return parseFloat(matches[1]) * 1000000;
      }
    }
    
    // Cas pour les valeurs en GWh
    if (productionString.includes('GWh')) {
      const matches = productionString.match(/(\d[\d\s.,]*)/);
      if (matches && matches[1]) {
        // Convertir GWh en une valeur proportionnelle pour comparaison
        return parseFloat(matches[1].replace(/\s/g, '').replace(',', '.')) * 100000;
      }
    }
    
    // Valeurs numériques standards (pour tonnes, etc.)
    const matches = productionString.match(/(\d[\d\s.,]*)/);
    if (matches && matches[1]) {
      // Gérer les plages comme "10 000-20 000"
      if (matches[1].includes('-')) {
        const range = matches[1].split('-');
        if (range.length === 2) {
          // Prendre la moyenne de la plage
          const min = parseFloat(range[0].replace(/\s/g, '').replace(',', '.'));
          const max = parseFloat(range[1].replace(/\s/g, '').replace(',', '.'));
          return (min + max) / 2;
        }
      }
      
      // Cas normal - nombre simple
      let value = matches[1].replace(/\s/g, '').replace(',', '.');
      // Gérer les valeurs avec '+' à la fin comme "10 000+"
      if (value.endsWith('+')) {
        value = value.substring(0, value.length - 1);
        // Ajouter 10% pour donner plus de poids aux valeurs avec '+'
        return parseFloat(value) * 1.1;
      }
      return parseFloat(value);
    }
    
    return 0;
  };

  // Trouver la production maximale pour la normalisation
  let maxProduction = 0;
  validPlants.forEach(plant => {
    const production = extractProduction(plant.production);
    if (production > maxProduction) maxProduction = production;
  });

  // Sans clustering
  return (
    <>
      {validPlants.map((plant) => {
        // Déterminer la couleur en fonction du statut
        let status = 'default';
        let color = 'grey';
        
        if (plant.status) {
          status = plant.status;
          color = statusToColor[status] || 'grey';
        } else if (plant.operational) {
          status = 'Opérationnel';
          color = 'green';
        } else if (plant.maintenance) {
          status = 'En maintenance';
          color = 'orange';
        } else if (plant.offline) {
          status = 'Hors ligne';
          color = 'red';
        } else if (plant.planning) {
          status = 'Planifié';
          color = 'blue';
        }
        
        // Calculer la taille de l'icône en fonction de la production
        const production = extractProduction(plant.production);
        // Un facteur entre 0.6 et 2.0 pour des différences plus visibles
        const sizeFactor = maxProduction > 0 
          ? 0.6 + (production / maxProduction) * 1.4
          : 1;
        
        // Debug: afficher la production et le facteur de taille dans la console
        console.log(`Raffinerie: ${plant.name}, Production: ${plant.production}, Valeur extraite: ${production}, Facteur: ${sizeFactor}`);
          
        const icon = createCustomIcon(color, sizeFactor);
        
        return (
          <Marker
            key={plant.id}
            position={[plant.latitude, plant.longitude]}
            icon={icon}
          >
            <Popup>
              <Box sx={{ minWidth: 240, maxWidth: 300 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {plant.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {plant.location}
                </Typography>
                
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>{t('status')}:</strong> {plant.status || status}
                </Typography>
                
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>{t('capacity')}:</strong> {plant.capacity || t('not_available')}
                </Typography>
                
                {plant.production && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Production:</strong> {plant.production}
                  </Typography>
                )}
                
                {plant.processing && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>{t('processing')}:</strong> {plant.processing}
                  </Typography>
                )}
                
                {plant.notes && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>{t('notes')}:</strong> {plant.notes}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                  {plant.website && (
                    <Link href={plant.website} target="_blank" rel="noopener noreferrer" sx={{ fontSize: '0.875rem' }}>
                      {t('visit')}
                    </Link>
                  )}
                  
                  <Link 
                    component={RouterLink} 
                    to={`/fonderie/${plant.id}`} 
                    color="primary"
                    sx={{ fontSize: '0.875rem', ml: 'auto' }}
                  >
                    {t('more_info')}
                  </Link>
                </Box>
              </Box>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

// Centrer par défaut sur les États-Unis
const defaultCenter = [39.8283, -98.5795]; // Centre des États-Unis
const defaultZoom = 4; // Zoom qui montre tous les États-Unis

// Paramètres par défaut pour la carte
const defaultSettings = {
  theme: 'light',
  language: 'fr',
  animations: true,
  notifications: true,
  highPerformance: false,
  mapStyle: 'standard',
  defaultZoom: '4',
  showLegend: true,
  markerClustering: false,
  zoomControls: true
};

// Composant principal de la carte
const MapView = ({ plants, onResize }) => {
  const settingsContext = useSettings();
  const { t } = useTranslation();
  const [map, setMap] = useState(null);
  const [mapHeight, setMapHeight] = useState(800);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHeightSlider, setShowHeightSlider] = useState(false);

  // Utiliser les paramètres du contexte s'ils existent, sinon utiliser les valeurs par défaut
  const appSettings = settingsContext?.settings || defaultSettings;

  // Centre de la carte (USA par défaut)
  const center = defaultCenter;
  const zoom = parseInt(appSettings.defaultZoom, 10) || defaultZoom;

  // Définir le fond de carte selon les paramètres
  const tileLayerUrl = appSettings.mapStyle === 'satellite' 
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : appSettings.mapStyle === 'terrain'
      ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      
  const tileLayerAttribution = appSettings.mapStyle === 'satellite'
    ? 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    : appSettings.mapStyle === 'terrain'
      ? 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  // Gérer le mode plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Force la mise à jour de la taille de la carte après le changement d'état (délai nécessaire)
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 100);
  };

  // Gérer l'affichage du slider de hauteur
  const toggleHeightSlider = () => {
    setShowHeightSlider(!showHeightSlider);
  };

  // Gérer le changement de hauteur
  const handleHeightChange = (e, newValue) => {
    setMapHeight(newValue);
    
    // Notifier le composant parent du changement de hauteur
    if (onResize) {
      onResize(newValue);
    }
    
    // Force la mise à jour de la taille de la carte après le changement de hauteur
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 50);
  };

  // Force la mise à jour de la taille de la carte après un rendu
  useEffect(() => {
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }, [mapHeight, isFullscreen, map]);

  // Style du conteneur de carte - ajoutant une classe pour identifier le conteneur
  const mapContainerStyle = {
    height: isFullscreen ? '90vh' : `${mapHeight}px`,
    width: '100%',
    margin: '0 auto', // Pour le centrer
    transition: appSettings.animations ? 'height 0.3s ease-in-out' : 'none',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: showHeightSlider ? '60px' : '20px',
    minWidth: '300px',
  };

  // Fonction pour obtenir la référence à l'instance de la carte
  const handleMapCreated = (mapInstance) => {
    setMap(mapInstance);
  };

  // Mise à jour pour la légende
  const renderLegend = () => {
    const statuses = [
      { id: 'operational', label: 'Opérationnel', color: statusToColor.Opérationnel },
      { id: 'construction', label: 'En construction', color: statusToColor['En construction'] },
      { id: 'planned', label: 'Planifié', color: statusToColor.Planifié },
      { id: 'paused', label: 'En pause', color: statusToColor['En pause'] }
    ];
    
    return (
      <Box sx={{ 
        position: 'absolute', 
        bottom: '20px', 
        right: '20px', 
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        padding: '12px', 
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        maxWidth: '200px'
      }}>
        <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ borderBottom: '1px solid rgba(0,0,0,0.1)', pb: 0.5 }}>
          {t('legend')}
        </Typography>
        {statuses.map(status => (
          <Box key={status.id} sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
            <Box 
              sx={{ 
                width: 14, 
                height: 14, 
                backgroundColor: `#${status.color === 'green' ? '00AA00' : 
                                    status.color === 'blue' ? '0000FF' : 
                                    status.color === 'orange' ? 'FFA500' : 
                                    status.color === 'red' ? 'FF0000' : '999999'}`, 
                borderRadius: '50%', 
                mr: 1.5 
              }} 
            />
            <Typography variant="body2">{status.label}</Typography>
          </Box>
        ))}
      </Box>
    );
  };

  // Support pour différents styles de carte via TileLayer
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        borderRadius: '10px',
        height: isFullscreen ? '95vh' : 'auto',
        position: 'relative',
        transition: appSettings.animations ? 'height 0.3s ease-in-out' : 'none',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, width: '100%' }}>
        <Typography variant="h6" component="h2" color="primary">
          {t('map_title')}
        </Typography>
        <Box>
          <Tooltip title={t('height_label')}>
            <IconButton onClick={toggleHeightSlider} size="small" sx={{ mr: 1 }}>
              <HeightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFullscreen ? t('exit_fullscreen') : t('fullscreen')}>
            <IconButton onClick={toggleFullscreen} size="small">
              {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {showHeightSlider && (
        <Box sx={{ width: '100%', mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            {t('height_label')}
          </Typography>
          <Slider
            value={mapHeight}
            min={500}
            max={1200}
            step={100}
            onChange={handleHeightChange}
            valueLabelDisplay="auto"
            aria-labelledby="map-height-slider"
          />
        </Box>
      )}

      {/* Utiliser une key pour forcer la remontée lorsque des paramètres importants changent */}
      <Box sx={{ width: '100%', height: `${mapHeight}px`, position: 'relative' }}>
        <MapContainer 
          key={`map-${appSettings.mapStyle}-${appSettings.defaultZoom}`}
          center={center} 
          zoom={zoom} 
          style={mapContainerStyle}
          zoomControl={appSettings.zoomControls}
          whenCreated={handleMapCreated}
          className="lithium-map"
        >
          <TileLayer
            url={tileLayerUrl}
            attribution={tileLayerAttribution}
          />
          
          {/* Afficher les marqueurs uniquement si plants existe et n'est pas vide */}
          {plants && plants.length > 0 && (
            <MapMarkers plants={plants} settings={appSettings} />
          )}
          
          {/* Contrôles de zoom conditionnels */}
          {appSettings.zoomControls && <ZoomControl position="topright" />}
      </MapContainer>
        
        {/* Légende mise à jour */}
        {appSettings.showLegend && renderLegend()}
    </Box>
    </Paper>
  );
};

export default MapView; 