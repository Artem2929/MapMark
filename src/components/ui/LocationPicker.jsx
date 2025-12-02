import React, {  useState , useCallback, useMemo, memo } from 'react';
import { classNames } from '../../utils/classNames';
import './LocationPicker.css';

const LocationPicker = memo(({  onLocationSelect, selectedLocation  }) => {
  const [locationInput, setLocationInput] = useState('');
  const [isEditing, setIsEditing] = useState(!selectedLocation);

  const handleAddLocation = () => {
    if (locationInput.trim()) {
      const location = {
        lat: 0,
        lng: 0,
        name: locationInput.trim()
      };
      onLocationSelect(location);
      setLocationInput('');
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddLocation();
    }
  };

  const handleEdit = () => {
    setLocationInput(selectedLocation?.name || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setLocationInput('');
    setIsEditing(false);
  };

  return (
    <div className="location-picker">
      {isEditing ? (
        <div className="location-input-container">
          <input
            type="text"
            placeholder="Введіть назву місця, міста або країни..."
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="location-input"
            autoFocus
          />
          <button 
            className="location-add-btn"
            onClick={handleAddLocation}
            disabled={!locationInput.trim()}
          >
            {selectedLocation ? 'Зберегти' : 'Додати'}
          </button>
          {selectedLocation && (
            <button 
              className="location-cancel-btn"
              onClick={handleCancel}
            >
              Скасувати
            </button>
          )}
        </div>
      ) : (
        selectedLocation ? (
          <div className="selected-location" onClick={handleEdit}>
            📍 {selectedLocation.name}
          </div>
        ) : (
          <div className="location-input-container">
            <input
              type="text"
              placeholder="Введіть назву місця, міста або країни..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="location-input"
            />
            <button 
              className="location-add-btn"
              onClick={handleAddLocation}
              disabled={!locationInput.trim()}
            >
              Додати
            </button>
          </div>
        )
      )}
    </div>
  );
});

LocationPicker.displayName = 'LocationPicker';

export default LocationPicker;