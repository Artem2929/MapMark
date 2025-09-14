import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ReviewForm.css';

const ReviewForm = ({ marker, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarClick = (starIndex, isHalf) => {
    const newRating = isHalf ? starIndex - 0.5 : starIndex;
    setRating(newRating);
  };

  const handleStarHover = (starIndex, isHalf) => {
    const newRating = isHalf ? starIndex - 0.5 : starIndex;
    setHoveredRating(newRating);
  };
  const [photo, setPhoto] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const reviewData = {
      text: reviewText,
      rating,
      photo,
      markerId: marker.id,
      timestamp: new Date().toISOString()
    };
    onSubmit(reviewData);
    onClose();
  };

  return (
    <div className="review-form-overlay">
      <div className="review-form">
        <div className="review-form-header">
          <div className="header-content">
            <div className="header-icon">📍</div>
            <div>
              <h3>{t('review.title')}</h3>
              <p className="header-subtitle">{t('review.subtitle')}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="location-info">
          <div className="location-header">
            <strong>{marker.name}</strong>
            <span className="location-coords">{t('popup.coordinates').replace('{lat}', marker.position[0].toFixed(4)).replace('{lng}', marker.position[1].toFixed(4))}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('review.yourReview')}</label>
            <div className="textarea-container">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder={t('review.placeholder')}
                required
                maxLength={500}
              />
              <div className="char-counter">{reviewText.length}/500</div>
            </div>
          </div>

          <div className="form-group">
            <label>{t('review.rating')}</label>
            <div className="rating-container">
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => {
                  const currentRating = hoveredRating || rating;
                  const isFilled = star <= currentRating;
                  const isHalfFilled = star - 0.5 === currentRating;
                  
                  return (
                    <div key={star} className="star-container">
                      <div 
                        className="star-half left"
                        onClick={() => handleStarClick(star, true)}
                        onMouseEnter={() => handleStarHover(star, true)}
                        onMouseLeave={() => setHoveredRating(0)}
                      >
                        <span className={`star-icon ${isHalfFilled || isFilled ? 'filled' : ''}`}>★</span>
                      </div>
                      <div 
                        className="star-half right"
                        onClick={() => handleStarClick(star, false)}
                        onMouseEnter={() => handleStarHover(star, false)}
                        onMouseLeave={() => setHoveredRating(0)}
                      >
                        <span className={`star-icon ${isFilled ? 'filled' : ''}`}>★</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="rating-text">
                <span>{hoveredRating || rating || 0} {t('review.outOfStars')}</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>{t('review.addPhoto')}</label>
            <div className="photo-upload">
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handlePhotoUpload}
                hidden
              />
              <label htmlFor="photo-upload" className="photo-upload-btn">
                📷 {photo ? photo.name : t('review.choosePhoto')}
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              {t('review.cancel')}
            </button>
            <button type="submit" className="publish-btn" disabled={!reviewText || !rating}>
              {t('review.publish')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;