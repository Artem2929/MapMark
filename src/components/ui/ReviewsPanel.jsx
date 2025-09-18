import React from 'react';
import ReviewService from '../../services/reviewService';
import './ReviewsPanel.css';

const ReviewsPanel = ({ marker, reviews, onClose, onAddReview }) => {
  // Filter reviews for this specific marker by coordinates (more reliable than markerId)
  const markerReviews = reviews.filter(review => {
    if (!marker || !review.lat || !review.lng) return false;
    const distance = Math.sqrt(
      Math.pow(review.lat - marker.position[0], 2) + 
      Math.pow(review.lng - marker.position[1], 2)
    );
    // Consider reviews within ~100m as being for the same location
    return distance < 0.001; // Roughly 100m in degrees
  });

  const getPhotoUrl = (photoId) => {
    if (!photoId) return null;
    // If it's a File object (from old format), create object URL
    if (photoId instanceof File) {
      return URL.createObjectURL(photoId);
    }
    // If it's a string (photo ID from backend), use the service
    return ReviewService.getPhotoUrl(photoId);
  };

  return (
    <div className="reviews-panel visible">
      <div className="reviews-panel-header">
        <div className="header-content">
          <h3>📍 {marker?.name}</h3>
          <p>Reviews ({markerReviews.length})</p>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="reviews-panel-content">
        {markerReviews.length > 0 ? (
          markerReviews.map((review, index) => (
            <div key={review._id || review.id || index} className="review-item">
              <div className="review-rating">
                {'★'.repeat(Math.floor(review.rating))}{'☆'.repeat(5 - Math.floor(review.rating))}
                <span className="rating-number">({review.rating})</span>
              </div>
              <p className="review-text">{review.review || review.text}</p>
              
              {/* Handle both old format (single photo) and new format (multiple photos) */}
              {review.photo && (
                <img 
                  src={getPhotoUrl(review.photo)} 
                  alt="Review photo" 
                  className="review-photo"
                />
              )}
              
              {review.photoIds && review.photoIds.length > 0 && (
                <div className="review-photos">
                  {review.photoIds.map((photoId, photoIndex) => (
                    <img 
                      key={photoIndex}
                      src={getPhotoUrl(photoId)} 
                      alt={`Review photo ${photoIndex + 1}`} 
                      className="review-photo"
                    />
                  ))}
                </div>
              )}
              
              <div className="review-date">
                {new Date(review.createdAt || review.timestamp).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <div className="no-reviews">
            <p>No reviews yet</p>
          </div>
        )}
        
        <button className="add-review-btn" onClick={onAddReview}>
          + Add Review
        </button>
      </div>
    </div>
  );
};

export default ReviewsPanel;