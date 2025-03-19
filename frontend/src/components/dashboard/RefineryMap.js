import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './RefineryMap.css';

// Create custom marker icons for different statuses
const createMarkerIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

const RefineryMap = ({ refineries, statusColors }) => {
  const [mapCenter, setMapCenter] = useState([45.0, -85.0]);
  const [mapZoom, setMapZoom] = useState(4);
  const [markerIcons, setMarkerIcons] = useState({});
  
  // Generate marker icons for each status
  useEffect(() => {
    const icons = {};
    for (const [status, color] of Object.entries(statusColors)) {
      icons[status] = createMarkerIcon(color);
    }
    
    // Default icon for unknown status
    icons.default = createMarkerIcon('#999999');
    
    setMarkerIcons(icons);
  }, [statusColors]);
  
  // When no data is available
  if (!refineries || refineries.length === 0) {
    return (
      <div className="map-placeholder">
        <p>Aucune donnée de carte disponible</p>
      </div>
    );
  }
  
  // Function to get the icon for a specific refinery
  const getIcon = (refinery) => {
    return markerIcons[refinery.status] || markerIcons.default;
  };
  
  return (
    <div className="refinery-map">
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        scrollWheelZoom={false}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {refineries.map(refinery => (
          <Marker 
            key={refinery.id}
            position={refinery.coordinates}
            icon={getIcon(refinery)}
          >
            <Popup>
              <div className="refinery-popup">
                <h3>{refinery.name}</h3>
                <p><strong>Emplacement:</strong> {refinery.location}</p>
                <p><strong>Statut:</strong> {refinery.status}</p>
                <p><strong>Production:</strong> {refinery.production}</p>
                {refinery.website && (
                  <p>
                    <strong>Site web:</strong>{' '}
                    <a href={refinery.website} target="_blank" rel="noopener noreferrer">
                      Visiter
                    </a>
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="map-legend">
        <h4>Légende</h4>
        <div className="legend-items">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="legend-item">
              <span className="legend-marker" style={{ backgroundColor: color }}></span>
              <span className="legend-label">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RefineryMap;