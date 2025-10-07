import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './MarkerPopup.css';

const MarkerPopup = ({ 
  marker, 
  reviews, 
  onAddReview, 
  onViewReviews, 
  onBuildRoute, 
  onDelete 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  const roundedRating = Math.round(avgRating);
  const stars = '⭐'.repeat(roundedRating);

  return (
    <div className="marker-popup">
      <div className="marker-popup-header">
        <div className="marker-popup-title">{marker.name}</div>
        <div className="marker-popup-coords">
          {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="marker-popup-reviews-badge">
          <span className="marker-popup-stars">{stars}</span>
          <span className="marker-popup-rating">{avgRating.toFixed(1)}</span>
          <span className="marker-popup-count">({reviews.length})</span>
        </div>
      )}

      <div className="marker-popup-actions">
        <button 
          className="marker-popup-item"
          onClick={isAuthenticated || reviews.length > 0 ? onAddReview : () => navigate('/login')}
        >
          <span className="marker-popup-item-icon">📝</span>
          <span className="marker-popup-item-text">{t('popup.addReview')}</span>
        </button>

        {reviews.length > 0 && (
          <button 
            className="marker-popup-item"
            onClick={onViewReviews}
          >
            <span className="marker-popup-item-icon">👁️</span>
            <span className="marker-popup-item-text">{t('popup.viewReviews')}</span>
            <span className="marker-popup-reviews-count">{reviews.length}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MarkerPopup;