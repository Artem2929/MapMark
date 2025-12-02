import React, { memo, useState } from 'react';
import { classNames } from '../../utils/classNames';
import './LocationMap.css';

const LocationMap = memo(({  location, showRouteButton = false  }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

LocationMap;

.displayName = 'LocationMap';

  const openInMaps = () => {
    const { lat, lng } = location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const copyCoordinates = () => {
    const coords = `${location.lat}, ${location.lng}`;
    navigator.clipboard.writeText(coords);
    alert('Координати скопійовано!');
  };

  return (
    <div className="location-map">
      <div className="map-container">
        {!mapLoaded && (
          <div className="map-placeholder">
            <div className="map-icon">🗺️</div>
            <p>Карта завантажується...</p>
            <button 
              className="load-map-btn"
              onClick={useCallback(() => setMapLoaded(true), [])}
            >
              Завантажити карту
            </button>
          </div>
        )}
        
        {mapLoaded && (
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${location.lat},${location.lng}&zoom=15`}
            width="100%"
            height="200"
            style={{ border: 0, borderRadius: '12px' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Карта розташування"
          />
        )}
        
        <div className="map-pin">
          📍
        </div>
      </div>
      
      <div className="map-actions">
        {showRouteButton && (
          <button className="route-btn" onClick={openInMaps}>
            🧭 Прокласти маршрут
          </button>
        )}
        
        <button className="coords-btn" onClick={copyCoordinates}>
          📋 Координати
        </button>
      </div>
    </div>
  );
};

export default LocationMap;