import React, { useState, useEffect } from 'react';
import VoiceReview from './VoiceReview';
import ARCamera from './ARCamera';
import SmartFilters from './SmartFilters';
import GamificationPanel from './GamificationPanel';
import SocialFeed from './SocialFeed';
import AnalyticsDashboard from './AnalyticsDashboard';
import FeatureShowcase from './FeatureShowcase';
import aiService from '../../services/aiService';
import gamificationService from '../../services/gamificationService';
import analyticsService from '../../services/analyticsService';
import './FeatureHub.css';

const FeatureHub = ({ userLocation, places = [] }) => {
  const [activeFeature, setActiveFeature] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [userProgress, setUserProgress] = useState(null);

  useEffect(() => {
    loadUserProgress();
    checkForNotifications();
    analyticsService.trackSession();
    
    return () => {
      analyticsService.endSession();
    };
  }, []);

  const loadUserProgress = () => {
    const progress = gamificationService.getUserProgress();
    setUserProgress(progress);
  };

  const checkForNotifications = () => {
    // Mock notifications - replace with real logic
    const mockNotifications = [
      {
        id: 1,
        type: 'new_place',
        title: 'Нове місце поблизу!',
        message: 'Кафе "Львівська кава" відкрилося за 200м від вас',
        icon: '📍',
        timestamp: new Date(),
        action: () => setActiveFeature('filters')
      },
      {
        id: 2,
        type: 'friend_review',
        title: 'Друг залишив відгук',
        message: 'Олена оцінила ресторан "Bernardazzi" на 5 зірок',
        icon: '👥',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        action: () => setActiveFeature('social')
      }
    ];

    setNotifications(mockNotifications);
  };

  const handleFeatureSelect = (feature) => {
    setActiveFeature(activeFeature === feature ? null : feature);
  };

  const handleReviewComplete = (review) => {
    // Process completed review
    const newBadges = gamificationService.checkBadges({ type: 'review' });
    gamificationService.addPoints(15, 'Новий відгук');
    
    if (newBadges.length > 0) {
      alert(`🎉 Новий бейдж: ${newBadges[0].name}!`);
    }
    
    loadUserProgress();
    setActiveFeature(null);
  };

  const handleFiltersChange = (filters) => {
    // Apply filters to places
    console.log('Filters applied:', filters);
  };

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'щойно';
    if (minutes < 60) return `${minutes} хв тому`;
    return `${Math.floor(minutes / 60)} год тому`;
  };

  return (
    <div className="feature-hub">
      {/* Floating Action Button */}
      <div className="fab-container">
        <button 
          className={`fab main-fab ${activeFeature ? 'active' : ''}`}
          onClick={() => setActiveFeature(activeFeature ? null : 'menu')}
        >
          {activeFeature ? '✕' : '✨'}
        </button>

        {activeFeature === 'menu' && (
          <div className="fab-menu">
            <button 
              className="fab feature-fab voice-fab"
              onClick={() => handleFeatureSelect('voice')}
              title="Голосовий відгук"
            >
              🎤
            </button>
            <button 
              className="fab feature-fab ar-fab"
              onClick={() => handleFeatureSelect('ar')}
              title="AR камера"
            >
              📱
            </button>
            <button 
              className="fab feature-fab filters-fab"
              onClick={() => handleFeatureSelect('filters')}
              title="Розумні фільтри"
            >
              🎯
            </button>
            <button 
              className="fab feature-fab gamification-fab"
              onClick={() => handleFeatureSelect('gamification')}
              title="Досягнення"
            >
              🏆
            </button>
            <button 
              className="fab feature-fab social-fab"
              onClick={() => handleFeatureSelect('social')}
              title="Соціальна стрічка"
            >
              📱
            </button>
            <button 
              className="fab feature-fab analytics-fab"
              onClick={() => handleFeatureSelect('analytics')}
              title="Аналітика"
            >
              📊
            </button>
          </div>
        )}
      </div>

      {/* User Progress Widget */}
      {userProgress && (
        <div className="progress-widget">
          <div className="progress-info">
            <span className="level-badge">
              {userProgress.currentLevel?.icon} Рівень {userProgress.level}
            </span>
            <span className="points-badge">
              {userProgress.points} балів
            </span>
          </div>
          <div className="progress-bar-mini">
            <div 
              className="progress-fill-mini"
              style={{ width: `${userProgress.progressToNext}%` }}
            />
          </div>
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.map(notification => (
            <div key={notification.id} className="notification">
              <div className="notification-icon">{notification.icon}</div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{formatTimeAgo(notification.timestamp)}</div>
              </div>
              <div className="notification-actions">
                {notification.action && (
                  <button 
                    className="notification-action-btn"
                    onClick={notification.action}
                  >
                    Переглянути
                  </button>
                )}
                <button 
                  className="notification-dismiss-btn"
                  onClick={() => dismissNotification(notification.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feature Panels */}
      {activeFeature === 'voice' && (
        <div className="feature-panel">
          <VoiceReview 
            onReviewComplete={handleReviewComplete}
            onCancel={() => setActiveFeature(null)}
          />
        </div>
      )}

      {activeFeature === 'ar' && (
        <ARCamera 
          places={places}
          userLocation={userLocation}
          onClose={() => setActiveFeature(null)}
        />
      )}

      {activeFeature === 'filters' && (
        <div className="feature-panel">
          <SmartFilters 
            onFiltersChange={handleFiltersChange}
            userLocation={userLocation}
          />
        </div>
      )}

      {activeFeature === 'social' && (
        <div className="feature-panel">
          <SocialFeed 
            userLocation={userLocation}
            friends={['Олена К.', 'Максим П.']}
          />
        </div>
      )}

      <GamificationPanel 
        isOpen={activeFeature === 'gamification'}
        onClose={() => setActiveFeature(null)}
      />
      
      <AnalyticsDashboard 
        isOpen={activeFeature === 'analytics'}
        onClose={() => setActiveFeature(null)}
      />
      
      <FeatureShowcase 
        isOpen={activeFeature === 'showcase'}
        onClose={() => setActiveFeature(null)}
      />

      {/* Quick Actions Bar */}
      <div className="quick-actions-bar">
        <button 
          className="quick-action-btn"
          onClick={() => handleFeatureSelect('voice')}
        >
          🎤 Відгук
        </button>
        <button 
          className="quick-action-btn"
          onClick={() => handleFeatureSelect('ar')}
        >
          📱 AR
        </button>
        <button 
          className="quick-action-btn"
          onClick={() => handleFeatureSelect('filters')}
        >
          🎯 Фільтри
        </button>
        <button 
          className="quick-action-btn showcase-btn"
          onClick={() => handleFeatureSelect('showcase')}
        >
          ✨ Функції
        </button>
      </div>
    </div>
  );
};

export default FeatureHub;