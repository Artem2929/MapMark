import React, { useState, useEffect } from 'react';
import './InteractiveMap.css';

const InteractiveMap = ({ address, onLocationSelect, selectedLocation }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (address) {
      setSearchQuery(address);
      // Автоматично шукати координати для адреси
      searchLocation(address);
    }
  }, [address]);

  const searchLocation = async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      // Симуляція пошуку через геокодинг API
      const mockResults = [
        {
          display_name: query,
          lat: 50.4501 + (Math.random() - 0.5) * 0.01,
          lon: 30.5234 + (Math.random() - 0.5) * 0.01
        }
      ];
      
      setSuggestions(mockResults);
      
      if (mockResults.length > 0) {
        const location = {
          lat: mockResults[0].lat,
          lng: mockResults[0].lon,
          address: mockResults[0].display_name
        };
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Помилка пошуку:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMapClick = (event) => {
    // Симуляція кліку по мапі
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Конвертуємо координати кліку в географічні координати
    const lat = 50.4501 + (y / rect.height - 0.5) * 0.02;
    const lng = 30.5234 + (x / rect.width - 0.5) * 0.02;
    
    const location = {
      lat: lat,
      lng: lng,
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    };
    
    onLocationSelect(location);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Моя поточна локація'
          };
          onLocationSelect(location);
        },
        (error) => {
          console.error('Помилка отримання локації:', error);
          alert('Не вдалося отримати вашу локацію');
        }
      );
    } else {
      alert('Геолокація не підтримується вашим браузером');
    }
  };

  return (
    <div className="interactive-map">
      <div className="map-search">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchLocation(searchQuery)}
            placeholder="Введіть адресу або назву місця"
            className="search-input"
          />
          <button 
            className="search-btn"
            onClick={() => searchLocation(searchQuery)}
            disabled={isSearching}
          >
            {isSearching ? '🔄' : '🔍'}
          </button>
        </div>
        
        <button 
          className="location-btn"
          onClick={getCurrentLocation}
          title="Використати мою локацію"
        >
          📍 Моя локація
        </button>
      </div>

      <div className="map-container">
        {!mapLoaded && (
          <div className="map-placeholder" onClick={() => setMapLoaded(true)}>
            <div className="map-icon">🗺️</div>
            <p>Натисніть для завантаження інтерактивної карти</p>
            <button className="load-map-btn">
              Завантажити карту
            </button>
          </div>
        )}
        
        {mapLoaded && (
          <div className="map-view" onClick={handleMapClick}>
            <div className="map-grid">
              {/* Симуляція карти з сіткою */}
              {Array.from({ length: 100 }, (_, i) => (
                <div key={i} className="grid-cell" />
              ))}
            </div>
            
            {selectedLocation && (
              <div 
                className="location-marker"
                style={{
                  left: `${((selectedLocation.lng - 30.5134) / 0.02 + 0.5) * 100}%`,
                  top: `${((selectedLocation.lat - 50.4401) / 0.02 + 0.5) * 100}%`
                }}
              >
                📍
              </div>
            )}
            
            <div className="map-controls">
              <button className="zoom-btn">➕</button>
              <button className="zoom-btn">➖</button>
            </div>
          </div>
        )}
      </div>

      {selectedLocation && (
        <div className="selected-location">
          <div className="location-info">
            <span className="location-icon">📍</span>
            <div className="location-details">
              <div className="location-address">{selectedLocation.address}</div>
              <div className="location-coords">
                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </div>
            </div>
          </div>
          <button 
            className="clear-location"
            onClick={() => onLocationSelect(null)}
          >
            ✕
          </button>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => {
                const location = {
                  lat: suggestion.lat,
                  lng: suggestion.lon,
                  address: suggestion.display_name
                };
                onLocationSelect(location);
                setSuggestions([]);
              }}
            >
              <span className="suggestion-icon">📍</span>
              <span className="suggestion-text">{suggestion.display_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;