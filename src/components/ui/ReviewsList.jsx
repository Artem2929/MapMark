import React, { useEffect, useRef, useState } from 'react';
import ReviewService from '../../services/reviewService';
import './ReviewsList.css';

const ReviewsList = ({ marker, onClose }) => {
  const reviewsListRef = useRef(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (reviewsListRef.current && !reviewsListRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  useEffect(() => {
    const fetchReviews = async () => {
      if (!marker) return;
      
      try {
        setLoading(true);
        const nearbyReviews = await ReviewService.getNearbyReviews(
          marker.position[0], 
          marker.position[1], 
          100 // 100 meters radius
        );
        setReviews(nearbyReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [marker]);
  
  const markerReviews = reviews;

  return (
    <div className="reviews-list" ref={reviewsListRef}>
      <div className="reviews-list-header">
        <h2>📍 {marker?.name}</h2>
        <button className="reviews-list-close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="reviews-list-content">
        {loading ? (
          <div className="reviews-list-loading">
            <div className="reviews-list-empty-icon">🔄</div>
            <h3>Loading reviews...</h3>
          </div>
        ) : markerReviews.length > 0 ? (
          markerReviews.map((review, index) => (
            <div key={review._id || review.id || index} className="reviews-list-item">
              <div className="reviews-list-header-info">
                <div className="reviews-list-user-info">
                  <div className="reviews-list-user-avatar">👤</div>
                  <div className="reviews-list-user-details">
                    <div className="reviews-list-user-name">Anonymous User</div>
                    <div className="reviews-list-time">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="reviews-list-rating">
                  {Array.from({length: 5}, (_, i) => (
                    <span key={i} className={`star ${i < Math.floor(review.rating) ? 'filled' : ''}`}>
                      {i < Math.floor(review.rating) ? '★' : '☆'}
                    </span>
                  ))}
                  <span className="reviews-list-rating-number">({review.rating})</span>
                </div>
              </div>
              
              <div className="reviews-list-content-text">
                <p>{review.review}</p>
              </div>
              
              {review.photos && review.photos.length > 0 && (
                <div className="reviews-list-photo-grid">
                  {review.photos.map((photo, photoIndex) => {
                    // Photo comes as object with base64 field that already contains data URL
                    const photoSrc = photo && photo.base64 ? photo.base64 : null;
                    
                    if (!photoSrc) return null;
                    
                    return (
                      <img 
                        key={photoIndex} 
                        src={photoSrc} 
                        alt={`Review photo ${photoIndex + 1}`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    );
                  })}
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