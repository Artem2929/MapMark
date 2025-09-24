import React, { useState, useEffect } from 'react';
import ReviewService from '../../services/reviewService';
import './ProgressWidget.css';

const ProgressWidget = ({ onReviewAdded }) => {
  const [stats, setStats] = useState({ reviewCount: 0, level: 1, progress: 0 });
  const [loading, setLoading] = useState(true);
  
  const fetchStats = async () => {
    try {
      const userStats = await ReviewService.getUserStats();
      setStats(userStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  useEffect(() => {
    if (onReviewAdded) {
      fetchStats();
    }
  }, [onReviewAdded]);
  
  if (loading) {
    return (
      <div className="progress-widget">
        <div className="progress-info">
          <span className="level-badge">📍 Завантаження...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="progress-widget">
      <div className="progress-info">
        <span className="level-badge">
          📍 Рівень {stats.level}
        </span>
        <span className="points-badge">
          {stats.reviewCount} відгуків
        </span>
      </div>
      <div className="progress-bar-mini">
        <div 
          className="progress-fill-mini"
          style={{ width: `${stats.progress}%` }}
        />
      </div>
      <div className="progress-text">
        {stats.level < 10 && stats.reviewsForNextLevel > 0 
          ? `Ще ${stats.reviewsForNextLevel} відгуків до ${stats.level + 1} рівня` 
          : stats.level === 10 
            ? 'Максимальний рівень!' 
            : `${Math.round(stats.progress)}% до наступного рівня`}
      </div>
    </div>
  );
};

export default ProgressWidget;