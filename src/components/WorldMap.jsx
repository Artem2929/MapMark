import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './WorldMap.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapClickHandler = ({ onMapClick }) => {
  const map = useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
      // Zoom in to clicked location
      map.flyTo(e.latlng, Math.min(map.getZoom() + 2, 18), {
        duration: 0.5
      });
    },
  });
  return null;
};

const WorldMap = ({ searchQuery }) => {
  const [markers, setMarkers] = useState([]);
  const [map, setMap] = useState(null);

  const handleMapClick = (latlng) => {
    const newMarker = {
      id: Date.now(),
      position: [latlng.lat, latlng.lng],
      name: `Location 1`
    };
    setMarkers([newMarker]);
  };

  const searchLocation = async (query) => {
    if (!query) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newMarker = {
          id: Date.now(),
          position: [parseFloat(lat), parseFloat(lon)],
          name: display_name
        };
        setMarkers([newMarker]);
        
        // Fly to location
        if (map) {
          map.flyTo([parseFloat(lat), parseFloat(lon)], 10);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Effect to handle search from header
  React.useEffect(() => {
    if (searchQuery) {
      searchLocation(searchQuery);
    }
  }, [searchQuery]);

  return (
    <div className="world-map-container">
      <MapContainer
        center={[20, 0]}
        zoom={3}
        minZoom={2}
        maxZoom={18}
        worldCopyJump={true}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        ref={setMap}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />
        <MapClickHandler onMapClick={handleMapClick} />
        
        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position}>
            <Popup>
              <div>
                <strong>{marker.name}</strong>
                <br />
                Lat: {marker.position[0].toFixed(4)}
                <br />
                Lng: {marker.position[1].toFixed(4)}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default WorldMap;