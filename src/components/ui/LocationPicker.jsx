import React, { useState } from 'react';
import './LocationPicker.css';

const LocationPicker = ({ onLocationSelect, selectedLocation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'Моє місцезнаходження'
          };
          onLocationSelect(location);
          setIsOpen(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  const mockLocations = [
    { name: 'Київ, Україна', lat: 50.4501, lng: 30.5234 },
    { name: 'Львів, Україна', lat: 49.8397, lng: 24.0297 },
    { name: 'Одеса, Україна', lat: 46.4825, lng: 30.7233 }
  ];

  const filteredLocations = mockLocations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="location-picker">
      <button 
        className="location-picker-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        📍 {selectedLocation?.name || 'Додати місце'}
      </button>
      
      {isOpen && (
        <div className="location-dropdown">
          <input
            type="text"
            placeholder="Пошук місця..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="location-search"
          />
          
          <button 
            className="location-item current-location"
            onClick={getCurrentLocation}
          >
            🎯 Використати поточне місце
          </button>
          
          {filteredLocations.map((location, index) => (
            <button
              key={index}
              className="location-item"
              onClick={() => {
                onLocationSelect(location);
                setIsOpen(false);
              }}
            >
              📍 {location.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;