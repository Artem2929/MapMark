import React, { useState, useEffect } from 'react';
import aiService from '../../services/aiService';
import './SmartFilters.css';

const SmartFilters = ({ onFiltersChange, userLocation }) => {
  const [filters, setFilters] = useState({
    category: '',
    rating: 0,
    distance: 1000,
    priceRange: '',
    accessibility: false,
    openNow: false,
    hasPhotos: false,
    friendsOnly: false,
    mood: '',
    timeOfDay: 'any'
  });

  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateSmartSuggestions();
  }, [userLocation]);

  const generateSmartSuggestions = async () => {
    if (!userLocation) return;
    
    setIsLoading(true);
    try {
      const currentHour = new Date().getHours();
      const recommendations = await aiService.getSmartRecommendations(
        filters, 
        userLocation, 
        currentHour
      );
      setSmartSuggestions(recommendations.categories);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const applySmartFilter = (category) => {
    handleFilterChange('category', category);
  };

  const resetFilters = () => {
    const defaultFilters = {
      category: '',
      rating: 0,
      distance: 1000,
      priceRange: '',
      accessibility: false,
      openNow: false,
      hasPhotos: false,
      friendsOnly: false,
      mood: '',
      timeOfDay: 'any'
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const getMoodEmoji = (mood) => {
    const moods = {
      'romantic': '💕',
      'family': '👨‍👩‍👧‍👦',
      'business': '💼',
      'casual': '😊',
      'party': '🎉',
      'quiet': '🤫',
      'adventure': '🏃‍♂️'
    };
    return moods[mood] || '😊';
  };

  return (
    <div className="smart-filters">
      <div className="filters-header">
        <h3>🎯 Розумні фільтри</h3>
        <button className="reset-btn" onClick={resetFilters}>
          Скинути
        </button>
      </div>

      {/* Smart Suggestions */}
      <div className="smart-suggestions">
        <h4>💡 Рекомендації для вас</h4>
        {isLoading ? (
          <div className="loading">Генерую рекомендації...</div>
        ) : (
          <div className="suggestions-grid">
            {smartSuggestions.map((category, index) => (
              <button
                key={index}
                className={`suggestion-chip ${filters.category === category ? 'active' : ''}`}
                onClick={() => applySmartFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="filter-group">
        <label>📂 Категорія</label>
        <select 
          value={filters.category} 
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">Всі категорії</option>
          <option value="Кафе">☕ Кафе</option>
          <option value="Ресторан">🍽️ Ресторан</option>
          <option value="Парк">🌳 Парк</option>
          <option value="Музей">🏛️ Музей</option>
          <option value="Магазин">🛍️ Магазин</option>
          <option value="Готель">🏨 Готель</option>
          <option value="Бар">🍺 Бар</option>
          <option value="Спорт">⚽ Спорт</option>
        </select>
      </div>

      {/* Rating Filter */}
      <div className="filter-group">
        <label>⭐ Мінімальний рейтинг</label>
        <div className="rating-slider">
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
          />
          <span className="rating-value">{filters.rating} ⭐</span>
        </div>
      </div>

      {/* Distance Filter */}
      <div className="filter-group">
        <label>📍 Відстань</label>
        <div className="distance-slider">
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={filters.distance}
            onChange={(e) => handleFilterChange('distance', parseInt(e.target.value))}
          />
          <span className="distance-value">
            {filters.distance < 1000 ? `${filters.distance}м` : `${filters.distance/1000}км`}
          </span>
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-group">
        <label>💰 Ціновий діапазон</label>
        <select 
          value={filters.priceRange} 
          onChange={(e) => handleFilterChange('priceRange', e.target.value)}
        >
          <option value="">Будь-який</option>
          <option value="budget">💸 Бюджетно</option>
          <option value="moderate">💳 Помірно</option>
          <option value="expensive">💎 Дорого</option>
          <option value="luxury">👑 Люкс</option>
        </select>
      </div>

      {/* Mood Filter */}
      <div className="filter-group">
        <label>😊 Настрій</label>
        <div className="mood-grid">
          {['romantic', 'family', 'business', 'casual', 'party', 'quiet', 'adventure'].map(mood => (
            <button
              key={mood}
              className={`mood-btn ${filters.mood === mood ? 'active' : ''}`}
              onClick={() => handleFilterChange('mood', filters.mood === mood ? '' : mood)}
            >
              {getMoodEmoji(mood)}
            </button>
          ))}
        </div>
      </div>

      {/* Time Filter */}
      <div className="filter-group">
        <label>🕐 Час відвідування</label>
        <select 
          value={filters.timeOfDay} 
          onChange={(e) => handleFilterChange('timeOfDay', e.target.value)}
        >
          <option value="any">Будь-який час</option>
          <option value="morning">🌅 Ранок (6-12)</option>
          <option value="afternoon">☀️ День (12-17)</option>
          <option value="evening">🌆 Вечір (17-22)</option>
          <option value="night">🌙 Ніч (22-6)</option>
        </select>
      </div>

      {/* Toggle Filters */}
      <div className="toggle-filters">
        <label className="toggle-item">
          <input
            type="checkbox"
            checked={filters.accessibility}
            onChange={(e) => handleFilterChange('accessibility', e.target.checked)}
          />
          <span className="toggle-label">♿ Доступність</span>
        </label>

        <label className="toggle-item">
          <input
            type="checkbox"
            checked={filters.openNow}
            onChange={(e) => handleFilterChange('openNow', e.target.checked)}
          />
          <span className="toggle-label">🕐 Відкрито зараз</span>
        </label>

        <label className="toggle-item">
          <input
            type="checkbox"
            checked={filters.hasPhotos}
            onChange={(e) => handleFilterChange('hasPhotos', e.target.checked)}
          />
          <span className="toggle-label">📸 З фото</span>
        </label>

        <label className="toggle-item">
          <input
            type="checkbox"
            checked={filters.friendsOnly}
            onChange={(e) => handleFilterChange('friendsOnly', e.target.checked)}
          />
          <span className="toggle-label">👥 Тільки друзі</span>
        </label>
      </div>

      {/* Active Filters Summary */}
      {Object.values(filters).some(v => v !== '' && v !== 0 && v !== 1000 && v !== false && v !== 'any') && (
        <div className="active-filters">
          <h4>Активні фільтри:</h4>
          <div className="active-filters-list">
            {filters.category && <span className="filter-tag">📂 {filters.category}</span>}
            {filters.rating > 0 && <span className="filter-tag">⭐ {filters.rating}+</span>}
            {filters.distance !== 1000 && <span className="filter-tag">📍 {filters.distance}м</span>}
            {filters.priceRange && <span className="filter-tag">💰 {filters.priceRange}</span>}
            {filters.mood && <span className="filter-tag">{getMoodEmoji(filters.mood)} {filters.mood}</span>}
            {filters.accessibility && <span className="filter-tag">♿ Доступно</span>}
            {filters.openNow && <span className="filter-tag">🕐 Відкрито</span>}
            {filters.hasPhotos && <span className="filter-tag">📸 З фото</span>}
            {filters.friendsOnly && <span className="filter-tag">👥 Друзі</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartFilters;