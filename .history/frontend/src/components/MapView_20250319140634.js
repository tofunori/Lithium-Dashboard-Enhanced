import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Box } from '@mui/material';

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

const MapView = ({ plants }) => {
  // Centre de la carte sur la France
  const defaultCenter = [46.603354, 1.888334];
  const defaultZoom = 5;

  // Vérifier si des plants avec des coordonnées sont disponibles
  const validPlants = plants.filter(
    (plant) => plant.latitude && plant.longitude
  );

  // Si aucune installation avec coordonnées n'est disponible, utiliser le centre par défaut
  const mapCenter = validPlants.length > 0
    ? [validPlants[0].latitude, validPlants[0].longitude]
    : defaultCenter;

  // Fonction pour déterminer le statut d'une installation
  const getPlantStatus = (plant) => {
    // Si le statut est directement disponible
    if (plant.status) return plant.status;
    
    // Sinon, on déduit du champ active
    return plant.active ? 'operational' : 'suspended';
  };

  return (
    <Box sx={{ height: '100%', minHeight: 300 }}>
      <MapContainer
        center={mapCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validPlants.map((plant) => {
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
                <div style={{ minWidth: '200px' }}>
                  <h3>{plant.name}</h3>
                  <p><strong>Emplacement:</strong> {plant.location}</p>
                  <p><strong>Pays:</strong> {plant.country}</p>
                  <p><strong>Statut:</strong> <span style={{ color: `var(--${color}-color, ${color})` }}>{statusText}</span></p>
                  <p><strong>Capacité:</strong> {plant.capacity} kg/mois</p>
                  <p><strong>Taux de recyclage:</strong> {plant.recycling_rate}%</p>
                  {plant.current_production && (
                    <p><strong>Production actuelle:</strong> {plant.current_production} kg/mois</p>
                  )}
                  {plant.processing && (
                    <p><strong>Technologie:</strong> {plant.processing}</p>
                  )}
                  {plant.website && (
                    <p><strong>Site web:</strong> <a href={plant.website} target="_blank" rel="noopener noreferrer">Visiter</a></p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Box>
  );
};

export default MapView; 