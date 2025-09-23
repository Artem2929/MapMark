import React from 'react';
import { useTranslation } from 'react-i18next';
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
          onClick={onAddReview}
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
            <span className="marker-popup-item-text">View Reviews</span>
            <span className="marker-popup-reviews-count">{reviews.length}</span>
          </button>
        )}

        <button 
          className="marker-popup-item"
          onClick={onBuildRoute}
        >
          <span className="marker-popup-item-icon">🗺️</span>
          <span className="marker-popup-item-text">Route</span>
        </button>

        <button 
          className="marker-popup-item marker-popup-item-danger"
          onClick={onDelete}
        >
          <span className="marker-popup-item-icon">🗑️</span>
          <span className="marker-popup-item-text">Delete</span>
        </button>
      </div>
    </div>
  );
};

export default MarkerPopup;