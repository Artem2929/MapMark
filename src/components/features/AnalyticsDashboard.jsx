import React, { useState, useEffect } from 'react';
import analyticsService from '../../services/analyticsService';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = ({ isOpen, onClose }) => {
  const [insights, setInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInsights();
    }
  }, [isOpen]);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const userInsights = analyticsService.getUserInsights();
      setInsights(userInsights);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    const data = analyticsService.exportUserData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mapmark-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    if (confirm('Ви впевнені, що хочете очистити всі аналітичні дані?')) {
      analyticsService.clearUserData();
      loadInsights();
    }
  };

  const renderOverview = () => (
    <div className="analytics-section">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-value">{insights?.totalPlacesVisited || 0}</div>
          <div className="stat-label">Відвідано місць</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">❤️</div>
          <div className="stat-value">{insights?.favoriteCategory || 'Немає'}</div>
          <div className="stat-label">Улюблена категорія</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🕐</div>
          <div className="stat-value">{insights?.mostActiveHour || 12}:00</div>
          <div className="stat-label">Найактивніша година</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-value">{insights?.averageSessionTime || 0} хв</div>
          <div className="stat-label">Середня сесія</div>
        </div>
      </div>

      {insights?.weeklyActivity && (
        <div className="weekly-activity">
          <h3>📊 Активність за тиждень</h3>
          <div className="activity-chart">
            {Object.entries(insights.weeklyActivity).map(([date, count]) => (
              <div key={date} className="activity-bar">
                <div 
                  className="bar-fill"
                  style={{ height: `${Math.max(10, count * 20)}px` }}
                />
                <div className="bar-label">
                  {new Date(date).toLocaleDateString('uk', { weekday: 'short' })}
                </div>
                <div className="bar-count">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSearchPatterns = () => (
    <div className="analytics-section">
      <h3>🔍 Патерни пошуку</h3>
      {insights?.searchPatterns?.length > 0 ? (
        <div className="search-patterns">
          {insights.searchPatterns.map((pattern, index) => (
            <div key={index} className="pattern-item">
              <div className="pattern-word">{pattern.word}</div>
              <div className="pattern-bar">
                <div 
                  className="pattern-fill"
                  style={{ width: `${(pattern.count / insights.searchPatterns[0].count) * 100}%` }}
                />
              </div>
              <div className="pattern-count">{pattern.count}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data">
          <div className="no-data-icon">🔍</div>
          <p>Поки що немає даних про пошук</p>
        </div>
      )}
    </div>
  );

  const renderLocationPatterns = () => (
    <div className="analytics-section">
      <h3>📍 Локаційні патерни</h3>
      {insights?.locationPatterns ? (
        <div className="location-insights">
          <div className="location-stat">
            <div className="location-icon">🎯</div>
            <div className="location-info">
              <div className="location-title">Центр активності</div>
              <div className="location-coords">
                {insights.locationPatterns.center.lat.toFixed(4)}, {insights.locationPatterns.center.lng.toFixed(4)}
              </div>
            </div>
          </div>
          
          <div className="location-stat">
            <div className="location-icon">📏</div>
            <div className="location-info">
              <div className="location-title">Радіус активності</div>
              <div className="location-value">{insights.locationPatterns.radius}м</div>
            </div>
          </div>
          
          {insights.locationPatterns.mostVisitedArea?.locations?.length > 0 && (
            <div className="location-stat">
              <div className="location-icon">🏆</div>
              <div className="location-info">
                <div className="location-title">Найпопулярніша зона</div>
                <div className="location-value">
                  {insights.locationPatterns.mostVisitedArea.locations.length} відвідувань
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="no-data">
          <div className="no-data-icon">📍</div>
          <p>Поки що немає локаційних даних</p>
        </div>
      )}
    </div>
  );

  const renderPrivacy = () => (
    <div className="analytics-section">
      <h3>🔒 Приватність та дані</h3>
      
      <div className="privacy-info">
        <div className="privacy-item">
          <div className="privacy-icon">📊</div>
          <div className="privacy-content">
            <h4>Збір даних</h4>
            <p>Ми збираємо аналітичні дані для покращення вашого досвіду. Всі дані зберігаються локально на вашому пристрої.</p>
          </div>
        </div>
        
        <div className="privacy-item">
          <div className="privacy-icon">🔐</div>
          <div className="privacy-content">
            <h4>Безпека</h4>
            <p>Ваші персональні дані не передаються третім особам і захищені сучасними методами шифрування.</p>
          </div>
        </div>
      </div>

      <div className="privacy-actions">
        <button className="privacy-btn export-btn" onClick={exportData}>
          📤 Експортувати дані
        </button>
        <button className="privacy-btn clear-btn" onClick={clearData}>
          🗑️ Очистити дані
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="analytics-overlay">
      <div className="analytics-dashboard">
        <div className="dashboard-header">
          <h2>📊 Аналітика та інсайти</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📈 Огляд
          </button>
          <button 
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Пошук
          </button>
          <button 
            className={`tab-btn ${activeTab === 'location' ? 'active' : ''}`}
            onClick={() => setActiveTab('location')}
          >
            📍 Локації
          </button>
          <button 
            className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            🔒 Приватність
          </button>
        </div>

        <div className="dashboard-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner">⏳</div>
              <p>Завантаження аналітики...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'search' && renderSearchPatterns()}
              {activeTab === 'location' && renderLocationPatterns()}
              {activeTab === 'privacy' && renderPrivacy()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;