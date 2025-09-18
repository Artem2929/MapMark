import React, { useState, useEffect } from 'react';
import visualFiltersService from '../../services/visualFiltersService';
import './VisualFilters.css';

const VisualFilters = ({ places, onFilteredPlaces }) => {
  const [activeFilters, setActiveFilters] = useState({ moods: [], sliders: {} });
  const [filteredPlaces, setFilteredPlaces] = useState(places);
  const [filterStats, setFilterStats] = useState(null);

  const moodFilters = visualFiltersService.getMoodFilters();
  const sliderFilters = visualFiltersService.getSliderFilters();

  useEffect(() => {
    const filters = visualFiltersService.getActiveFilters();
    setActiveFilters(filters);
  }, []);

  useEffect(() => {
    const filtered = visualFiltersService.filterPlaces(places);
    setFilteredPlaces(filtered);
    onFilteredPlaces?.(filtered);
    
    const stats = visualFiltersService.getFilterStats(places, filtered);
    setFilterStats(stats);
  }, [places, activeFilters]);

  const handleMoodToggle = (moodId) => {
    visualFiltersService.toggleMoodFilter(moodId);
    const newFilters = visualFiltersService.getActiveFilters();
    setActiveFilters(newFilters);
  };

  const handleSliderChange = (sliderId, value) => {
    visualFiltersService.setSliderFilter(sliderId, value);
    const newFilters = visualFiltersService.getActiveFilters();
    setActiveFilters(newFilters);
  };

  const clearAllFilters = () => {
    visualFiltersService.clearAllFilters();
    setActiveFilters({ moods: [], sliders: {} });
  };

  const getRecommendedFilters = () => {
    return visualFiltersService.getRecommendedFilters();
  };

  return (
    <div className="visual-filters">
      <div className="filters-header">
        <h3>🎨 Візуальні фільтри</h3>
        {(activeFilters.moods.length > 0 || Object.keys(activeFilters.sliders).length > 0) && (
          <button className="clear-filters-btn" onClick={clearAllFilters}>
            Очистити
          </button>
        )}
      </div>

      {/* Mood Filters */}
      <div className="mood-filters-section">
        <h4>😊 Настрій місця</h4>
        <div className="mood-filters-grid">
          {moodFilters.map(mood => (
            <button
              key={mood.id}
              className={`mood-filter-btn ${activeFilters.moods.includes(mood.id) ? 'active' : ''}`}
              onClick={() => handleMoodToggle(mood.id)}
              style={{
                '--mood-color': mood.color,
                backgroundColor: activeFilters.moods.includes(mood.id) ? mood.color : 'transparent',
                borderColor: mood.color,
                color: activeFilters.moods.includes(mood.id) ? 'white' : mood.color
              }}
            >
              <span className="mood-icon">{mood.icon}</span>
              <span className="mood-name">{mood.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slider Filters */}
      <div className="slider-filters-section">
        <h4>🎚️ Характеристики</h4>
        <div className="slider-filters-list">
          {sliderFilters.map(slider => (
            <div key={slider.id} className="slider-filter">
              <div className="slider-header">
                <span className="slider-name">{slider.name}</span>
                <span className="slider-value">
                  {activeFilters.sliders[slider.id] || slider.defaultValue}%
                </span>
              </div>
              
              <div className="slider-container">
                <div className="slider-labels">
                  <span className="slider-label left">
                    {slider.leftIcon} {slider.leftLabel}
                  </span>
                  <span className="slider-label right">
                    {slider.rightLabel} {slider.rightIcon}
                  </span>
                </div>
                
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  value={activeFilters.sliders[slider.id] || slider.defaultValue}
                  onChange={(e) => handleSliderChange(slider.id, parseInt(e.target.value))}
                  className="visual-slider"
                  style={{ '--slider-color': slider.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Filters */}
      <RecommendedFilters 
        recommendations={getRecommendedFilters()}
        onApplyRecommendation={handleMoodToggle}
      />

      {/* Filter Stats */}
      {filterStats && (
        <div className="filter-stats">
          <div className="stats-header">
            <h4>📊 Результати фільтрації</h4>
          </div>
          <div className="stats-content">
            <div className="stat-item">
              <span className="stat-icon">📍</span>
              <span className="stat-text">
                Знайдено {filterStats.filtered} з {filterStats.total} місць 
                ({filterStats.percentage}%)
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎯</span>
              <span className="stat-text">
                Активно фільтрів: {filterStats.activeMoods + filterStats.activeSliders}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filtered Places Preview */}
      <div className="filtered-preview">
        <h4>🎯 Відфільтровані місця</h4>
        <div className="preview-list">
          {filteredPlaces.slice(0, 5).map(place => (
            <div key={place.id} className="preview-item">
              <div 
                className="place-color-indicator"
                style={{ 
                  backgroundColor: visualFiltersService.getPlaceColorCoding(place)
                }}
              />
              <div className="preview-info">
                <div className="preview-name">{place.name}</div>
                <div className="preview-meta">
                  {place.category} • ⭐ {place.rating || 'N/A'}
                  {place.filterScore && (
                    <span className="filter-score">
                      • {Math.round(place.filterScore)}% відповідність
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredPlaces.length > 5 && (
            <div className="preview-more">
              +{filteredPlaces.length - 5} більше місць
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RecommendedFilters = ({ recommendations, onApplyRecommendation }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="recommended-filters">
      <h4>💡 Рекомендовані фільтри</h4>
      <div className="recommendations-list">
        {recommendations.map((rec, index) => (
          <div key={index} className="recommendation-item">
            <div className="rec-content">
              <div className="rec-filter">
                {moodFilters.find(m => m.id === rec.id)?.icon} {moodFilters.find(m => m.id === rec.id)?.name}
              </div>
              <div className="rec-reason">{rec.reason}</div>
            </div>
            <button
              className="apply-rec-btn"
              onClick={() => onApplyRecommendation(rec.id)}
            >
              Застосувати
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisualFilters;