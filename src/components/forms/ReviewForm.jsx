import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StarRating from '../ui/StarRating';
import './ReviewForm.css';

const ReviewForm = ({ marker, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
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
        <div className="drag-handle"></div>
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
              <StarRating
                value={rating}
                onChange={setRating}
                size={32}
              />
              <div className="rating-text">
                <span>{rating || 0} {t('review.outOfStars')}</span>
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