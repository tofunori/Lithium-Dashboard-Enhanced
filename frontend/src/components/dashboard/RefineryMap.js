import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import './RefineryMap.css';

const RefineryMap = ({ refineries, statusColors }) => {
  // Default center position (North America)
  const defaultCenter = [45.0, -95.0];
  const defaultZoom = 4;
  
  // Get a marker color based on refinery status
  const getMarkerColor = (status) => {
    const defaultColor = '#666666';
    
    if (!statusColors || !status) return defaultColor;
    
    return statusColors[status] || defaultColor;
  };
  
  // Create a custom marker icon with the appropriate color
  const createMarkerIcon = (status) => {
    const color = getMarkerColor(status);
    
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    });
  };
  
  return (
    <div className="refinery-map">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {refineries.map(refinery => (
          <Marker 
            key={refinery.id}
            position={refinery.coordinates}
            icon={createMarkerIcon(refinery.status)}
          >
            <Popup>
              <div className="map-popup">
                <h3>{refinery.name}</h3>
                <p><strong>Emplacement:</strong> {refinery.location}</p>
                <p><strong>Statut:</strong> {refinery.status}</p>
                <p><strong>Production:</strong> {refinery.production}</p>
                {refinery.website && (
                  <p>
                    <a href={refinery.website} target="_blank" rel="noopener noreferrer">
                      Site web
                    </a>
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default RefineryMap;