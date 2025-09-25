import React, { useState, useEffect } from 'react';
import ReviewService from '../../services/reviewService';
import useReviews from '../../hooks/useReviews';
import './ProgressWidget.css';

const ProgressWidget = ({ onReviewAdded }) => {
  const { reviews, loading: reviewsLoading } = useReviews();
  const [stats, setStats] = useState({ reviewCount: 0, level: 1, progress: 0 });
  
  useEffect(() => {
    if (reviews.length > 0) {
      const { level, progress, reviewsForNextLevel } = ReviewService.calculateLevelProgress(reviews.length);
      setStats({
        reviewCount: reviews.length,
        level,
        progress,
        reviewsForNextLevel
      });
    }
  }, [reviews]);
  
  if (reviewsLoading) {
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