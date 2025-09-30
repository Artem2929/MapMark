import React, { useState, useEffect } from 'react';
import compareService from '../../services/compareService';
import './QuickCompare.css';

const QuickCompare = ({ isOpen, onClose }) => {
  const [compareList, setCompareList] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen) {
      loadCompareData();
    }
  }, [isOpen]);

  const loadCompareData = () => {
    const list = compareService.getCompareList();
    setCompareList(list);
    
    if (list.length >= 2) {
      const comp = compareService.generateComparison();
      setComparison(comp);
    }
  };

  const handleRemovePlace = (placeId) => {
    compareService.removeFromCompare(placeId);
    loadCompareData();
  };

  const handleClearAll = () => {
    compareService.clearCompare();
    setCompareList([]);
    setComparison(null);
  };

  if (!isOpen) return null;

  return (
    <div className="compare-overlay">
      <div className="compare-panel">
        <div className="compare-header">
          <h2>⚖️ Порівняння місць</h2>
          <div className="header-actions">
            {compareList.length > 0 && (
              <button className="clear-all-btn" onClick={handleClearAll}>
                Очистити все
              </button>
            )}
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {compareList.length === 0 ? (
          <div className="empty-compare">
            <div>⚖️</div>
            <h3>Список порівняння порожній</h3>
            <p>Додайте місця для порівняння, натиснувши кнопку "+" біля місць на карті</p>
          </div>
        ) : compareList.length === 1 ? (
          <div className="single-place">
            <PlaceCard place={compareList[0]} onRemove={handleRemovePlace} />
            <p className="add-more-hint">Додайте ще одне місце для порівняння</p>
          </div>
        ) : (
          <div className="compare-content">
            <div className="compare-tabs">
              <button 
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Огляд
              </button>
              <button 
                className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Деталі
              </button>
              <button 
                className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
                onClick={() => setActiveTab('recommendations')}
              >
                Рекомендації
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'overview' && (
                <OverviewTab 
                  places={compareList} 
                  comparison={comparison}
                  onRemove={handleRemovePlace}
                />
              )}
              {activeTab === 'details' && (
                <DetailsTab comparison={comparison} />
              )}
              {activeTab === 'recommendations' && (
                <RecommendationsTab comparison={comparison} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PlaceCard = ({ place, onRemove, isWinner = false, winnerType = '' }) => (
  <div className={`place-card ${isWinner ? 'winner' : ''}`}>
    {isWinner && (
      <div className="winner-badge">
        🏆 {winnerType}
      </div>
    )}
    <div className="place-header">
      <div className="place-info">
        <h4>{place.name}</h4>
        <span className="place-category">{place.category}</span>
      </div>
      <button className="remove-btn" onClick={() => onRemove(place.id)}>✕</button>
    </div>
    <div className="place-stats">
      <div className="stat">
        <span className="stat-label">Рейтинг</span>
        <span className="stat-value">⭐ {place.rating || 'N/A'}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Ціна</span>
        <span className="stat-value">
          {'💰'.repeat(place.priceLevel || 1)}
        </span>
      </div>
      <div className="stat">
        <span className="stat-label">Відстань</span>
        <span className="stat-value">
          {place.distance < 1000 ? 
            `${Math.round(place.distance)}м` : 
            `${(place.distance/1000).toFixed(1)}км`
          }
        </span>
      </div>
    </div>
  </div>
);

const OverviewTab = ({ places, comparison, onRemove }) => (
  <div className="overview-tab">
    <div className="places-grid">
      {places.map(place => (
        <PlaceCard key={place.id} place={place} onRemove={onRemove} />
      ))}
    </div>

    {comparison && (
      <div className="quick-comparison">
        <div className="comparison-item">
          <h4>🏆 Найкращий рейтинг</h4>
          <div className="winner-info">
            <span className="winner-name">{comparison.comparison.ratings.winner.name}</span>
            <span className="winner-value">⭐ {comparison.comparison.ratings.winner.rating}</span>
          </div>
        </div>

        <div className="comparison-item">
          <h4>💰 Найдешевше</h4>
          <div className="winner-info">
            <span className="winner-name">{comparison.comparison.prices.cheapest.name}</span>
            <span className="winner-value">{comparison.comparison.prices.cheapest.priceLevelText}</span>
          </div>
        </div>

        <div className="comparison-item">
          <h4>📍 Найближче</h4>
          <div className="winner-info">
            <span className="winner-name">{comparison.comparison.distances.closest.name}</span>
            <span className="winner-value">{comparison.comparison.distances.closest.distanceText}</span>
          </div>
        </div>
      </div>
    )}
  </div>
);

const DetailsTab = ({ comparison }) => {
  if (!comparison) return null;

  return (
    <div className="details-tab">
      <div className="detail-section">
        <h4>⭐ Рейтинги</h4>
        <div className="rating-comparison">
          {comparison.comparison.ratings.items.map(item => (
            <div key={item.id} className={`rating-item ${item.isHighest ? 'best' : ''}`}>
              <span className="place-name">{item.name}</span>
              <span className="rating-value">⭐ {item.rating}</span>
              {item.isHighest && <span className="best-badge">Найкращий</span>}
            </div>
          ))}
        </div>
        <p className="analysis">{comparison.comparison.ratings.analysis}</p>
      </div>

      <div className="detail-section">
        <h4>💰 Ціни</h4>
        <div className="price-comparison">
          {comparison.comparison.prices.items.map(item => (
            <div key={item.id} className={`price-item ${item.isCheapest ? 'best' : ''}`}>
              <span className="place-name">{item.name}</span>
              <span className="price-value">{item.priceLevelText}</span>
              {item.isCheapest && <span className="best-badge">Найдешевше</span>}
            </div>
          ))}
        </div>
        <p className="analysis">{comparison.comparison.prices.analysis}</p>
      </div>

      <div className="detail-section">
        <h4>🕐 Години роботи</h4>
        <div className="hours-comparison">
          {comparison.comparison.workingHours.map(item => (
            <div key={item.id} className={`hours-item ${item.isOpen ? 'open' : 'closed'}`}>
              <span className="place-name">{item.name}</span>
              <span className="status">{item.status}</span>
              <span className="hours">{item.todayHours}</span>
              {item.nextChange && <span className="next-change">{item.nextChange}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RecommendationsTab = ({ comparison }) => {
  if (!comparison) return null;

  return (
    <div className="recommendations-tab">
      <div className="recommendations-list">
        {comparison.comparison.recommendations.map((rec, index) => (
          <div key={index} className="recommendation-card">
            <div className="rec-header">
              <span className="rec-type">{getRecommendationIcon(rec.type)}</span>
              <h4>{getRecommendationTitle(rec.type)}</h4>
            </div>
            <div className="rec-place">{rec.place.name}</div>
            <div className="rec-reason">{rec.reason}</div>
          </div>
        ))}
      </div>

      <div className="summary-section">
        <h4>📊 Підсумок</h4>
        <div className="summary-stats">
          <div className="summary-item">
            <span className="summary-label">Всього місць:</span>
            <span className="summary-value">{comparison.summary.totalPlaces}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Середній рейтинг:</span>
            <span className="summary-value">⭐ {comparison.summary.avgRating}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Категорії:</span>
            <span className="summary-value">{comparison.summary.categories.join(', ')}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Ціновий діапазон:</span>
            <span className="summary-value">{comparison.summary.priceRange}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const getRecommendationIcon = (type) => {
  const icons = {
    best_rated: '⭐',
    best_value: '💰',
    closest: '📍'
  };
  return icons[type] || '👍';
};

const getRecommendationTitle = (type) => {
  const titles = {
    best_rated: 'Найкращий рейтинг',
    best_value: 'Найкраща ціна',
    closest: 'Найближче розташування'
  };
  return titles[type] || 'Рекомендація';
};

export default QuickCompare;