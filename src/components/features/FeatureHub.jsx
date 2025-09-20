import React, { useState, useEffect } from 'react';
import VoiceReview from './VoiceReview';
import ARCamera from './ARCamera';
import SmartFilters from './SmartFilters';
import GamificationPanel from './GamificationPanel';
import SocialFeed from './SocialFeed';
import AnalyticsDashboard from './AnalyticsDashboard';
import FeatureShowcase from './FeatureShowcase';
import NotificationPanel from '../ui/NotificationPanel';
import ProgressWidget from '../ui/ProgressWidget';
import aiService from '../../services/aiService';
import gamificationService from '../../services/gamificationService';
import analyticsService from '../../services/analyticsService';
import './FeatureHub.css';

const FeatureHub = ({ userLocation, places = [], isReviewFormOpen = false }) => {
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

  const handleNotificationAction = (notification) => {
    if (notification.action) {
      notification.action();
    }
  };

  return (
    <div className="feature-hub">
      {/* Floating Action Button */}
      {!isReviewFormOpen && <div className="fab-container">
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
      </div>}

      {/* User Progress Widget */}
      {!isReviewFormOpen && <ProgressWidget userProgress={userProgress} />}

      {/* Notifications */}
      {!isReviewFormOpen && <NotificationPanel 
        notifications={notifications}
        onDismiss={dismissNotification}
        onAction={handleNotificationAction}
      />}

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
            onClose={() => setActiveFeature(null)}
          />
        </div>
      )}

      {activeFeature === 'social' && (
        <div className="feature-panel">
          <SocialFeed 
            userLocation={userLocation}
            friends={['Олена К.', 'Максим П.']}
            onClose={() => setActiveFeature(null)}
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


    </div>
  );
};

export default FeatureHub;