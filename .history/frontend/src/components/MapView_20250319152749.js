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

// Composant pour rendre les marqueurs à l'intérieur de MapContainer
const MapMarkers = ({ plants, settings }) => {
  // Valeurs par défaut pour settings si non fourni
  const safeSettings = settings || {
    markerClustering: false
  };
  
  // Fonction pour déterminer le statut d'une installation
  const getPlantStatus = (plant) => {
    // Si le statut est directement disponible
    if (plant.status) return plant.status;
    
    // Sinon, on déduit du champ active
    return plant.active ? 'operational' : 'suspended';
  };

  // Filtrer les installations avec des coordonnées valides
  const validPlants = plants ? plants.filter(
    (plant) => plant.latitude && plant.longitude
  ) : [];

  // Créer les marqueurs
  const markers = validPlants.map((plant) => {
    // Déterminer le statut et la couleur correspondante
    const status = getPlantStatus(plant);
    const color = statusToColor[status] || statusToColor.default;
    const statusText = statusTranslation[status] || statusTranslation.default;
    
    return (
      <Marker
        key={plant.id}
        position={[plant.latitude, plant.longitude]}
        icon={createCustomIcon(color)}
      >
        <Popup>
          <div style={{ minWidth: '250px' }}>
            <h3 style={{ marginTop: '8px', marginBottom: '12px' }}>{plant.name}</h3>
            <p style={{ margin: '6px 0' }}><strong>Emplacement:</strong> {plant.location}</p>
            <p style={{ margin: '6px 0' }}><strong>Pays:</strong> {plant.country}</p>
            <p style={{ margin: '6px 0' }}><strong>Statut:</strong> <span style={{ color: `var(--${color}-color, ${color})` }}>{statusText}</span></p>
            <p style={{ margin: '6px 0' }}><strong>Capacité:</strong> {plant.capacity} kg/mois</p>
            <p style={{ margin: '6px 0' }}><strong>Taux de recyclage:</strong> {plant.recycling_rate}%</p>
            {plant.current_production && (
              <p style={{ margin: '6px 0' }}><strong>Production actuelle:</strong> {plant.current_production} kg/mois</p>
            )}
            {plant.processing && (
              <p style={{ margin: '6px 0' }}><strong>Technologie:</strong> {plant.processing}</p>
            )}
            <p style={{ margin: '6px 0' }}><strong>Site web:</strong> {plant.website ? 
              <a href={plant.website} target="_blank" rel="noopener noreferrer" style={{ color: '#2a6ac8', textDecoration: 'none' }}>Visiter</a> : 
              <span style={{ color: 'gray', fontStyle: 'italic' }}>Non disponible</span>}
            </p>
          </div>
        </Popup>
      </Marker>
    );
  });

  // Pour l'instant, retourner toujours les marqueurs sans clustering
  return markers;
  
  // Cette partie est commentée temporairement
  /*
  return settings.markerClustering ? (
    <MarkerClusterGroup chunkedLoading>
      {markers}
    </MarkerClusterGroup>
  ) : markers;
  */
};

// Composant principal de la carte
const MapView = ({ plants }) => {
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
            onChange={(e, newValue) => setMapHeight(newValue)}
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