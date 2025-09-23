import React from 'react';
import './ReviewsList.css';

const ReviewsList = ({ marker, reviews, onClose }) => {
  const markerReviews = reviews.filter(review => {
    if (!marker || !review.lat || !review.lng) return false;
    const distance = Math.sqrt(
      Math.pow(review.lat - marker.position[0], 2) + 
      Math.pow(review.lng - marker.position[1], 2)
    );
    return distance < 0.001;
  });

  return (
    <div className="reviews-list">
      <div className="reviews-list-header">
        <h2>📍 {marker?.name}</h2>
        <button className="reviews-list-close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="reviews-list-content">
        {markerReviews.length > 0 ? (
          markerReviews.map((review, index) => (
            <div key={review._id || review.id || index} className="reviews-list-item">
              <div className="reviews-list-header-info">
                <div className="reviews-list-user-info">
                  <div className="reviews-list-user-avatar">👤</div>
                  <div className="reviews-list-user-details">
                    <div className="reviews-list-user-name">Anonymous User</div>
                    <div className="reviews-list-time">
                      {new Date(review.createdAt || review.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="reviews-list-rating">
                  {'★'.repeat(Math.floor(review.rating))}{'☆'.repeat(5 - Math.floor(review.rating))}
                  <span className="reviews-list-rating-number">({review.rating})</span>
                </div>
              </div>
              
              <div className="reviews-list-content-text">
                <p>{review.review || review.text}</p>
              </div>
              
              {(review.photo || (review.photoIds && review.photoIds.length > 0)) && (
                <div className="reviews-list-photo-grid">
                  {review.photo && (
                    <img src={review.photo} alt="Review photo" />
                  )}
                  {review.photoIds && review.photoIds.map((photoId, photoIndex) => (
                    <img key={photoIndex} src={photoId} alt={`Review photo ${photoIndex + 1}`} />
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="reviews-list-empty-state">
            <div className="reviews-list-empty-icon">📝</div>
            <h3>No reviews yet</h3>
            <p>Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsList;