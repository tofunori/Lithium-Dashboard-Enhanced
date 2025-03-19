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

// Correction pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Définir des icônes personnalisées selon le statut
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Mapper les statuts aux couleurs d'icônes
const statusToColor = {
  operational: 'green',
  construction: 'orange',
  planned: 'blue',
  approved: 'violet',
  suspended: 'red',
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

  // Déterminer le statut de l'usine en fonction de ses propriétés
  const getPlantStatus = (plant) => {
    if (plant.operational) return { status: t('operational'), color: 'blue' };
    if (plant.maintenance) return { status: t('maintenance'), color: 'yellow' };
    if (plant.offline) return { status: t('offline'), color: 'red' };
    return { status: t('planning'), color: 'grey' };
  };

  // Vérifier si le clustering est activé
  if (safeSettings.markerClustering) {
    // Temporairement désactivé pour éviter les erreurs
    // Note: Le clustering a été commenté pour éviter les erreurs de contexte
    return (
      <>
        {validPlants.map((plant) => {
          const { status, color } = getPlantStatus(plant);
          const icon = createCustomIcon(color);
          
          return (
            <Marker 
              key={plant.id} 
              position={[plant.latitude, plant.longitude]} 
              icon={icon}
            >
              <Popup>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {plant.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {plant.location}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>{t('status')}:</strong> {status}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>{t('capacity')}:</strong> {plant.capacity || t('not_available')}
                  </Typography>
                  
                  {plant.website && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>{t('website')}:</strong> 
                      <a href={plant.website} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 5 }}>
                        {t('visit')}
                      </a>
                    </Typography>
                  )}
                </Box>
              </Popup>
            </Marker>
          );
        })}
      </>
    );
  }
  
  // Sans clustering
  return (
    <>
      {validPlants.map((plant) => {
        const { status, color } = getPlantStatus(plant);
        const icon = createCustomIcon(color);
        
        return (
          <Marker 
            key={plant.id} 
            position={[plant.latitude, plant.longitude]} 
            icon={icon}
          >
            <Popup>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {plant.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {plant.location}
                </Typography>
                
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>{t('status')}:</strong> {status}
                </Typography>
                
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>{t('capacity')}:</strong> {plant.capacity || t('not_available')}
                </Typography>
                
                {plant.website && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>{t('website')}:</strong> 
                    <a href={plant.website} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 5 }}>
                      {t('visit')}
                    </a>
                  </Typography>
                )}
              </Box>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

// Composant principal de la carte
const MapView = ({ plants, onResize }) => {
  const settingsContext = useSettings();
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapHeight, setMapHeight] = useState(500);
  const [showHeightSlider, setShowHeightSlider] = useState(false);

  // Définir les paramètres par défaut si les settings ne sont pas disponibles
  const defaultSettings = {
    theme: 'light',
    language: 'fr',
    animations: true,
    notifications: true,
    highPerformance: false,
    mapStyle: 'standard',
    defaultZoom: '5',
    showLegend: true,
    markerClustering: false, // Désactivé temporairement
    zoomControls: true
  };

  // Utiliser les paramètres du contexte s'ils existent, sinon utiliser les valeurs par défaut
  const settings = settingsContext?.settings || defaultSettings;

  // Centre de la carte (France)
  const center = [46.603354, 1.8883335];
  const zoom = parseInt(settings.defaultZoom, 10);

  // Définir le fond de carte selon les paramètres
  let tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  let tileLayerAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  if (settings.mapStyle === 'satellite') {
    tileLayerUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    tileLayerAttribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
  } else if (settings.mapStyle === 'terrain') {
    tileLayerUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    tileLayerAttribution = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';
  }

  // Gérer le mode plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
  };

  // Style du conteneur de carte
  const mapContainerStyle = {
    height: isFullscreen ? '90vh' : `${mapHeight}px`,
    width: '100%',
    transition: settings.animations ? 'height 0.3s ease-in-out' : 'none',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: showHeightSlider ? '60px' : '20px'
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
        transition: settings.animations ? 'height 0.3s ease-in-out' : 'none',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
        <Box sx={{ mx: 2, mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            {t('height_label')}
          </Typography>
          <Slider
            value={mapHeight}
            min={300}
            max={800}
            step={50}
            onChange={handleHeightChange}
            valueLabelDisplay="auto"
            aria-labelledby="map-height-slider"
          />
        </Box>
      )}

      {/* Utiliser une key pour forcer la remontée lorsque des paramètres importants changent */}
      <MapContainer 
        key={`map-${settings.mapStyle}-${settings.defaultZoom}`}
        center={center} 
        zoom={zoom} 
        style={mapContainerStyle}
        zoomControl={settings.zoomControls}
      >
        <TileLayer
          url={tileLayerUrl}
          attribution={tileLayerAttribution}
        />
        
        {/* Afficher les marqueurs uniquement si plants existe et n'est pas vide */}
        {plants && plants.length > 0 && (
          <MapMarkers plants={plants} settings={settings} />
        )}
        
        {/* Contrôles de zoom conditionnels */}
        {settings.zoomControls && <ZoomControl position="topright" />}
      </MapContainer>
      
      {/* Légende conditionnelle */}
      {settings.showLegend && (
        <Box sx={{ 
          position: 'absolute', 
          bottom: '20px', 
          right: '20px', 
          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
          padding: '10px', 
          borderRadius: '5px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
          zIndex: 1000
        }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('legend')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#007bff', borderRadius: '50%', mr: 1 }} />
            <Typography variant="body2">{t('operational')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#ffc107', borderRadius: '50%', mr: 1 }} />
            <Typography variant="body2">{t('maintenance')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#dc3545', borderRadius: '50%', mr: 1 }} />
            <Typography variant="body2">{t('offline')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#6c757d', borderRadius: '50%', mr: 1 }} />
            <Typography variant="body2">{t('planning')}</Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default MapView; 