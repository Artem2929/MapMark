import React, { useState, useRef, useEffect } from 'react';
import '../../styles/location-dropdown.css';

const LocationDropdown = ({
  value = '',
  onChange,
  placeholder = "Пошук місця...",
  locations = [
    { id: 'kyiv', name: 'Київ, Україна', icon: '📍' },
    { id: 'lviv', name: 'Львів, Україна', icon: '📍' },
    { id: 'odesa', name: 'Одеса, Україна', icon: '📍' }
  ],
  showCurrentLocation = true,
  onCurrentLocation,
  disabled = false,
  className = ""
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef(null);

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const allItems = showCurrentLocation 
    ? [{ id: 'current', name: 'Використати поточне місце', icon: '🎯', isCurrent: true }, ...filteredLocations]
    : filteredLocations;

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleLocationSelect = (location) => {
    if (location.isCurrent) {
      onCurrentLocation?.();
    } else {
      setInputValue(location.name);
      onChange?.(location);
    }
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => prev < allItems.length - 1 ? prev + 1 : prev);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && allItems[activeIndex]) {
        handleLocationSelect(allItems[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className={`location-dropdown ${className}`} ref={dropdownRef}>
      <input
        type="text"
        className="location-search"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoComplete="off"
      />
      
      {isOpen && allItems.length > 0 && (
        <div className="location-items">
          {allItems.map((location, index) => (
            <button
              key={location.id}
              type="button"
              className={`location-item ${location.isCurrent ? 'current-location' : ''} ${
                index === activeIndex ? 'location-item--active' : ''
              }`}
              onClick={() => handleLocationSelect(location)}
              disabled={disabled}
            >
              <span className="location-item__icon">{location.icon}</span>
              <span className="location-item__text">{location.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationDropdown;