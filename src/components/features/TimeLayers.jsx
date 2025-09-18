import React, { useState, useEffect } from 'react';
import timeLayersService from '../../services/timeLayersService';
import './TimeLayers.css';

const TimeLayers = ({ places, onFilteredPlaces }) => {
  const [activeLayer, setActiveLayer] = useState('now');
  const [filteredPlaces, setFilteredPlaces] = useState(places);

  const layers = timeLayersService.getAllLayers();

  useEffect(() => {
    const filtered = timeLayersService.filterPlacesByLayer(places, activeLayer);
    setFilteredPlaces(filtered);
    onFilteredPlaces?.(filtered);
  }, [places, activeLayer]);

  const handleLayerChange = (layerId) => {
    setActiveLayer(layerId);
    timeLayersService.setActiveLayer(layerId);
  };

  return (
    <div className="time-layers">
      <div className="time-layers-header">
        <h3>⏰ Часові шари</h3>
        <div className="active-layer-info">
          {layers.find(l => l.id === activeLayer)?.description}
        </div>
      </div>

      <div className="layers-selector">
        {layers.map(layer => (
          <button
            key={layer.id}
            className={`layer-btn ${activeLayer === layer.id ? 'active' : ''}`}
            onClick={() => handleLayerChange(layer.id)}
            style={{ 
              '--layer-color': layer.color,
              backgroundColor: activeLayer === layer.id ? layer.color : 'transparent',
              borderColor: layer.color,
              color: activeLayer === layer.id ? 'white' : layer.color
            }}
          >
            <span className="layer-icon">{layer.icon}</span>
            <span className="layer-name">{layer.name}</span>
          </button>
        ))}
      </div>

      <div className="layer-stats">
        <div className="stat-item">
          <span className="stat-label">Доступно місць:</span>
          <span className="stat-value">{filteredPlaces.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Відкрито зараз:</span>
          <span className="stat-value">
            {filteredPlaces.filter(p => p.layerData?.isOpen).length}
          </span>
        </div>
      </div>

      {activeLayer !== 'now' && (
        <div className="layer-info">
          <div className="info-card">
            <div className="info-icon">💡</div>
            <div className="info-text">
              {getLayerDescription(activeLayer)}
            </div>
          </div>
        </div>
      )}

      <div className="places-preview">
        {filteredPlaces.slice(0, 3).map(place => (
          <PlaceTimeCard key={place.id} place={place} />
        ))}
        {filteredPlaces.length > 3 && (
          <div className="more-places">
            +{filteredPlaces.length - 3} більше місць
          </div>
        )}
      </div>
    </div>
  );
};

const PlaceTimeCard = ({ place }) => {
  const layerData = place.layerData || {};

  return (
    <div className="place-time-card">
      <div className="place-basic-info">
        <div className="place-name">{place.name}</div>
        <div className="place-category">{place.category}</div>
      </div>

      <div className="place-time-info">
        <div className={`status-indicator ${layerData.status || 'unknown'}`}>
          {getStatusIcon(layerData.status)}
          <span>{getStatusText(layerData.status)}</span>
        </div>

        {layerData.crowdLevel && (
          <div className={`crowd-level ${layerData.crowdLevel}`}>
            {getCrowdIcon(layerData.crowdLevel)}
            <span>{getCrowdText(layerData.crowdLevel)}</span>
          </div>
        )}

        {layerData.nextOpenTime && (
          <div className="next-open">
            🕐 {layerData.nextOpenTime}
          </div>
        )}

        {layerData.specialOffers && layerData.specialOffers.length > 0 && (
          <div className="special-offers">
            {layerData.specialOffers.map((offer, index) => (
              <div key={index} className="offer-tag">
                {getOfferIcon(offer.type)} {offer.text}
              </div>
            ))}
          </div>
        )}

        {layerData.recommendation && (
          <div className="recommendation">
            💡 {layerData.recommendation}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getLayerDescription = (layerId) => {
  const descriptions = {
    morning: 'Показує місця, які зазвичай працюють вранці та підходять для сніданку',
    afternoon: 'Відображає місця для обіду та денного відпочинку',
    evening: 'Місця для вечірнього дозвілля та вечері',
    weekend: 'Спеціальний режим для вихідних днів'
  };
  return descriptions[layerId] || '';
};

const getStatusIcon = (status) => {
  const icons = {
    open: '🟢',
    closed: '🔴',
    usually_open: '🟡',
    usually_closed: '⚫',
    weekend_open: '🟢',
    weekend_closed: '🔴',
    unknown: '❓'
  };
  return icons[status] || '❓';
};

const getStatusText = (status) => {
  const texts = {
    open: 'Відкрито',
    closed: 'Зачинено',
    usually_open: 'Зазвичай відкрито',
    usually_closed: 'Зазвичай зачинено',
    weekend_open: 'Працює у вихідні',
    weekend_closed: 'Не працює у вихідні',
    unknown: 'Невідомо'
  };
  return texts[status] || 'Невідомо';
};

const getCrowdIcon = (level) => {
  const icons = {
    low: '🟢',
    medium: '🟡',
    high: '🔴'
  };
  return icons[level] || '❓';
};

const getCrowdText = (level) => {
  const texts = {
    low: 'Мало людей',
    medium: 'Помірно',
    high: 'Багато людей'
  };
  return texts[level] || '';
};

const getOfferIcon = (type) => {
  const icons = {
    happy_hour: '🍻',
    breakfast: '🥐',
    weekend_discount: '💰',
    lunch_special: '🍽️'
  };
  return icons[type] || '🎁';
};

export default TimeLayers;