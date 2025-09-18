import React from 'react';
import './ReviewsPanel.css';

const ReviewsPanel = ({ marker, reviews, onClose, onAddReview }) => {
  const markerReviews = reviews.filter(review => review.markerId === marker?.id);

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
            <div key={review.id || index} className="review-item">
              <div className="review-rating">
                {'★'.repeat(Math.floor(review.rating))}{'☆'.repeat(5 - Math.floor(review.rating))}
                <span className="rating-number">({review.rating})</span>
              </div>
              <p className="review-text">{review.text}</p>
              {review.photo && (
                <img 
                  src={URL.createObjectURL(review.photo)} 
                  alt="Review photo" 
                  className="review-photo"
                />
              )}
              <div className="review-date">
                {new Date(review.timestamp).toLocaleDateString()}
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