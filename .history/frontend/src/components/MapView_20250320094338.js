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
import { useRefineries } from '../contexts/RefineryContext';

// Correction pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Définir des icônes personnalisées selon le statut et la production
const createCustomIcon = (color, size = 1) => {
  // Améliorer la visibilité en rendant les points plus grands par défaut
  // Et en accentuant davantage les différences de taille
  const baseSize = 30; // Taille de base beaucoup plus grande (était 22)
  const finalSize = Math.round(baseSize * size);
  const borderWidth = Math.max(2, Math.round(size * 1.5)); // Bordure plus visible

  console.log(`Création icône: couleur=${color}, tailleFactor=${size}, tailleFinale=${finalSize}px`);
  
  // Utiliser une approche différente avec des divs personnalisés au lieu d'images
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color === 'green' ? '#00AA00' : 
                            color === 'blue' ? '#1976D2' : 
                            color === 'red' ? '#FF0000' : 
                            color === 'orange' ? '#FFA500' : 
                            color === 'violet' ? '#9C27B0' : '#999999'};
        width: ${finalSize}px;
        height: ${finalSize}px;
        border-radius: 50%;
        border: ${borderWidth}px solid white;
        box-shadow: 0 0 ${Math.round(size * 5)}px rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
      "></div>
    `,
    iconSize: [finalSize, finalSize],
    iconAnchor: [finalSize/2, finalSize/2],
    popupAnchor: [0, -finalSize/2]
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
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              backgroundColor: 'grey',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              mb: 0.5
            }} 
          />
          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Faible</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 20, 
              height: 20, 
              borderRadius: '50%', 
              backgroundColor: 'grey',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              mb: 0.5
            }} 
          />
          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Moyenne</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 30, 
              height: 30, 
              borderRadius: '50%', 
              backgroundColor: 'grey',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              mb: 0.5
            }} 
          />
          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Élevée</Typography>
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
    
    // Afficher la chaîne brute pour le debug
    console.log(`Analyse de la production: "${productionString}"`);
    
    // Cas spécial pour "1 million de VE" ou expressions avec "million"
    if (productionString.toLowerCase().includes('million')) {
      const matches = productionString.match(/(\d+(?:[\.,]\d+)?)[\s]*million/i);
      if (matches && matches[1]) {
        const value = parseFloat(matches[1].replace(',', '.')) * 1000000;
        console.log(`  → Détecté format 'million': ${value}`);
        return value;
      }
    }
    
    // Cas pour les valeurs en GWh
    if (productionString.toLowerCase().includes('gwh')) {
      const matches = productionString.match(/(\d+(?:[\s\.,]\d+)?)/);
      if (matches && matches[1]) {
        // Convertir GWh en une valeur proportionnelle pour comparaison
        const value = parseFloat(matches[1].replace(/\s/g, '').replace(',', '.')) * 100000;
        console.log(`  → Détecté format 'GWh': ${value}`);
        return value;
      }
    }
    
    // Cas pour les "tonnes par an"
    if (productionString.toLowerCase().includes('tonne')) {
      const matches = productionString.match(/(\d+(?:[\s\.,]\d+)?)/);
      if (matches && matches[1]) {
        const value = parseFloat(matches[1].replace(/\s/g, '').replace(',', '.'));
        console.log(`  → Détecté format 'tonnes': ${value}`);
        return value;
      }
    }
    
    // Valeurs numériques standards (pour autres unités)
    const matches = productionString.match(/(\d+(?:[\s\.,]\d+)?)/);
    if (matches && matches[1]) {
      // Gérer les plages comme "10 000-20 000"
      if (matches[1].includes('-')) {
        const range = matches[1].split('-');
        if (range.length === 2) {
          // Prendre la moyenne de la plage
          const min = parseFloat(range[0].replace(/\s/g, '').replace(',', '.'));
          const max = parseFloat(range[1].replace(/\s/g, '').replace(',', '.'));
          const value = (min + max) / 2;
          console.log(`  → Détecté format 'plage': ${value} (${min}-${max})`);
          return value;
        }
      }
      
      // Cas normal - nombre simple
      let value = matches[1].replace(/\s/g, '').replace(',', '.');
      // Gérer les valeurs avec '+' à la fin comme "10 000+"
      if (value.endsWith('+')) {
        value = value.substring(0, value.length - 1);
        // Ajouter 10% pour donner plus de poids aux valeurs avec '+'
        const finalValue = parseFloat(value) * 1.1;
        console.log(`  → Détecté format 'plus': ${finalValue} (${value}+)`);
        return finalValue;
      }
      
      const finalValue = parseFloat(value);
      console.log(`  → Détecté format 'nombre standard': ${finalValue}`);
      return finalValue;
    }
    
    console.log("  → Aucun format détecté, retourne 0");
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
        
        // Utiliser une formule exponentielle plus agressive pour rendre les différences très visibles
        const sizeFactor = maxProduction > 0 
          ? 0.8 + (Math.pow(production / maxProduction, 0.4) * 4.0)  // Exposant plus petit et multiplicateur plus grand pour amplifier les différences
          : 1;
        
        // Debug: afficher la production et le facteur de taille dans la console
        console.log(`Raffinerie: ${plant.name}, Production: ${plant.production}, Valeur extraite: ${production}, Facteur: ${sizeFactor.toFixed(2)}, Max: ${maxProduction}`);
          
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
  
  // Générer une clé unique basée sur les données pour forcer la reconstruction de la carte
  const mapKey = plants ? `map-${appSettings.mapStyle}-${appSettings.defaultZoom}-${plants.length}-${Date.now()}` : 'map-initial';

  // Styles CSS personnalisés pour les marqueurs
  useEffect(() => {
    // Ajouter des styles personnalisés pour les marqueurs
    const style = document.createElement('style');
    style.textContent = `
      .custom-div-icon {
        background-color: transparent !important;
        border: none;
        width: auto !important;
        height: auto !important;
      }
      .leaflet-marker-icon {
        transition: all 0.2s ease-in-out;
      }
      .leaflet-marker-icon:hover {
        transform: scale(1.1);
        z-index: 1000 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
          key={mapKey}
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