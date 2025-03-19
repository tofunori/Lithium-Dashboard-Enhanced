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

        {validPlants.map((plant) => (
          <Marker
            key={plant.id}
            position={[plant.latitude, plant.longitude]}
          >
            <Popup>
              <div>
                <h3>{plant.name}</h3>
                <p>Capacité: {plant.capacity} kg/mois</p>
                <p>Taux de recyclage: {plant.recycling_rate}%</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default MapView; 