import React, { useState, useEffect } from 'react';
import './InteractiveMap.css';

const InteractiveMap = ({ address, onLocationSelect, selectedLocation }) => {
  const [mapLocation, setMapLocation] = useState(selectedLocation || { lat: 50.4501, lng: 30.5234 });
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // Симуляція карти
    setIsMapReady(true);
  }, []);

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Конвертуємо координати кліку в lat/lng (приблизно)
    const lat = 50.4501 + (rect.height / 2 - y) * 0.001;
    const lng = 30.5234 + (x - rect.width / 2) * 0.001;
    
    const newLocation = { lat, lng };
    setMapLocation(newLocation);
    onLocationSelect(newLocation);
  };

  const searchLocation = async () => {
    if (!address) return;
    
    // Симуляція геокодування
    const mockLocation = { 
      lat: 50.4501 + Math.random() * 0.01, 
      lng: 30.5234 + Math.random() * 0.01 
    };
    
    setMapLocation(mockLocation);
    onLocationSelect(mockLocation);
  };

  return (
    <div className="interactive-map">
      <div className="map-controls">
        <div className="search-box">
          <input
            type="text"
            value={address}
            readOnly
            placeholder="Введіть адресу для пошуку на карті"
          />
          <button type="button" onClick={searchLocation} disabled={!address}>
            🔍 Знайти
          </button>
        </div>
      </div>

      <div className="map-container" onClick={handleMapClick}>
        <div className="map-placeholder">
          <div className="map-grid">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="grid-cell" />
            ))}
          </div>
          
          {selectedLocation && (
            <div 
              className="location-marker"
              style={{
                left: `${50 + (selectedLocation.lng - 30.5234) * 1000}%`,
                top: `${50 - (selectedLocation.lat - 50.4501) * 1000}%`
              }}
            >
              📍
            </div>
          )}
          
          <div className="map-overlay">
            <p>Клікніть на карті, щоб обрати локацію</p>
            {selectedLocation && (
              <div className="coordinates">
                📍 {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;