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
  // Fonction pour déterminer le statut d'une installation
  const getPlantStatus = (plant) => {
    // Si le statut est directement disponible
    if (plant.status) return plant.status;
    
    // Sinon, on déduit du champ active
    return plant.active ? 'operational' : 'suspended';
  };

  // Filtrer les installations avec des coordonnées valides
  const validPlants = plants.filter(
    (plant) => plant.latitude && plant.longitude
  );

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

const MapView = ({ plants, onResize }) => {
  const { settings } = useSettings();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapHeight, setMapHeight] = useState(100); // pourcentage de la hauteur
  const [showHeightControl, setShowHeightControl] = useState(false);

  // Centre de la carte sur la France
  const defaultCenter = [46.603354, 1.888334];
  const defaultZoom = parseInt(settings.defaultZoom) || 5;

  // Vérifier si des plants avec des coordonnées sont disponibles
  const validPlants = plants.filter(
    (plant) => plant.latitude && plant.longitude
  );

  // Si aucune installation avec coordonnées n'est disponible, utiliser le centre par défaut
  const mapCenter = validPlants.length > 0
    ? [validPlants[0].latitude, validPlants[0].longitude]
    : defaultCenter;

  // Gérer le basculement en mode plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Gérer le changement de hauteur
  const handleHeightChange = (event, newValue) => {
    setMapHeight(newValue);
    
    // Notifier le composant parent du changement de hauteur
    if (onResize) {
      onResize(newValue);
    }
  };

  // Effet pour s'assurer que la carte reste bien dimensionnée au chargement
  useEffect(() => {
    if (onResize) {
      onResize(mapHeight);
    }
  }, []);

  // Déterminer le bon URL de tuile en fonction du style de carte sélectionné
  const getTileUrl = () => {
    switch(settings.mapStyle) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'standard':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  // Déterminer l'attribution en fonction du style de carte
  const getTileAttribution = () => {
    switch(settings.mapStyle) {
      case 'satellite':
        return '&copy; <a href="https://www.arcgis.com/">Esri</a>';
      case 'terrain':
        return '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>';
      case 'standard':
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }
  };

  return (
    <Box 
      sx={{ 
        position: 'relative', 
        width: '100%', 
        height: isFullscreen ? '100vh' : '100%',
        zIndex: isFullscreen ? 1300 : 'auto',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        backgroundColor: isFullscreen ? 'white' : 'transparent',
        padding: isFullscreen ? 2 : 0,
        transition: settings.animations ? 'all 0.3s ease' : 'none'
      }}
    >
      {/* Contrôles de redimensionnement */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          zIndex: 1000,
          display: 'flex',
          gap: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '4px',
          padding: '4px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        {!isFullscreen && (
          <Tooltip title="Ajuster la hauteur">
            <IconButton 
              size="small" 
              onClick={() => setShowHeightControl(!showHeightControl)}
              sx={{ backgroundColor: showHeightControl ? 'rgba(0, 0, 0, 0.08)' : 'transparent' }}
            >
              <HeightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}>
          <IconButton size="small" onClick={toggleFullscreen}>
            {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Contrôle de hauteur */}
      {showHeightControl && !isFullscreen && (
        <Paper 
          elevation={2} 
          sx={{ 
            position: 'absolute', 
            top: 50, 
            right: 10, 
            zIndex: 1000,
            width: 200,
            padding: 2,
            backgroundColor: 'white',
            borderRadius: '4px'
          }}
        >
          <Typography variant="caption" gutterBottom>
            Hauteur de la carte
          </Typography>
          <Slider
            value={mapHeight}
            onChange={handleHeightChange}
            min={50}
            max={150}
            step={5}
            valueLabelDisplay="auto"
            valueLabelFormat={value => `${value}%`}
          />
        </Paper>
      )}

      <MapContainer
        center={mapCenter}
        zoom={defaultZoom}
        style={{ 
          height: '100%', 
          width: '100%', 
          borderRadius: isFullscreen ? '0' : '8px'
        }}
        zoomControl={settings.zoomControls}
      >
        <TileLayer
          attribution={getTileAttribution()}
          url={getTileUrl()}
        />
        <MapMarkers plants={plants} settings={settings} />
      </MapContainer>
      
      {/* Afficher la légende seulement si activée dans les paramètres */}
      {settings.showLegend && <MapLegend />}

      {/* Bouton pour quitter le mode plein écran quand on est en plein écran */}
      {isFullscreen && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 20, 
            left: 20,
            zIndex: 1000,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>Carte des Installations</Typography>
        </Box>
      )}
    </Box>
  );
};

export default MapView; 