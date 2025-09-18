import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StarRating from '../ui/StarRating';
import ReviewService from '../../services/reviewService';
import './ReviewForm.css';

const ReviewForm = ({ marker, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length <= 5) {
      setPhotos(prev => [...prev, ...files]);
    } else {
      setError('Maximum 5 photos allowed');
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const reviewData = {
        lng: marker.position[1], // Longitude
        lat: marker.position[0], // Latitude
        review: reviewText.trim(),
        rating,
        photos
      };

      // Validate data
      const validation = ReviewService.validateReviewData(reviewData);
      if (!validation.isValid) {
        setError(validation.errors.join(' '));
        return;
      }

      // Submit to backend
      const createdReview = await ReviewService.createReview(reviewData);
      
      // Call parent callback with the created review
      onSubmit({
        ...createdReview,
        markerId: marker.id,
        // For backward compatibility, also include the old format
        text: createdReview.review,
        photo: photos[0], // First photo for backward compatibility
        timestamp: createdReview.createdAt
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
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
            <label>{t('review.addPhoto')} ({photos.length}/5)</label>
            <div className="photo-upload">
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                hidden
              />
              <label htmlFor="photo-upload" className="photo-upload-btn">
                📷 {photos.length > 0 ? `Add More Photos` : t('review.choosePhoto')}
              </label>
            </div>
            
            {photos.length > 0 && (
              <div className="photo-preview-container">
                {photos.map((photo, index) => (
                  <div key={index} className="photo-preview">
                    <img 
                      src={URL.createObjectURL(photo)} 
                      alt={`Preview ${index + 1}`}
                      className="photo-preview-img"
                    />
                    <button
                      type="button"
                      className="photo-remove-btn"
                      onClick={() => removePhoto(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              {t('review.cancel')}
            </button>
            <button 
              type="submit" 
              className="publish-btn" 
              disabled={!reviewText || !rating || isSubmitting}
            >
              {isSubmitting ? 'Publishing...' : t('review.publish')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;