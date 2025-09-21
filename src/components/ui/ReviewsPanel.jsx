import React, { useState } from 'react';
import ReviewService from '../../services/reviewService';
import './ReviewsPanel.css';

const ReviewsPanel = ({ marker, reviews, onClose, onAddReview, onReviewDeleted }) => {
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);
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

  const handleDeleteReview = async (reviewId) => {
    console.log('Attempting to delete review with ID:', reviewId);
    
    if (!reviewId) {
      alert('Invalid review ID. Cannot delete review.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setDeletingReviewId(reviewId);
    try {
      console.log('Calling ReviewService.deleteReview with ID:', reviewId);
      
      // Check if this is a mock review (starts with '507f1f77bcf86cd7994390')
      if (reviewId.startsWith('507f1f77bcf86cd7994390')) {
        console.log('Mock review detected, deleting locally only');
        // For mock reviews, just call the callback to remove from UI
        if (onReviewDeleted) {
          onReviewDeleted(reviewId);
        }
      } else {
        // For real reviews, call the API
        await ReviewService.deleteReview(reviewId);
        console.log('Review deleted successfully from API');
        
        // Call parent callback to update the reviews list
        if (onReviewDeleted) {
          onReviewDeleted(reviewId);
        }
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert(`Failed to delete review: ${error.message}`);
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleDeletePhoto = async (reviewId, photoId) => {
    console.log('Attempting to delete photo with ID:', photoId, 'from review:', reviewId);
    
    if (!reviewId || !photoId) {
      alert('Invalid review ID or photo ID. Cannot delete photo.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    setDeletingPhotoId(photoId);
    try {
      console.log('Calling ReviewService.deletePhoto with review ID:', reviewId, 'and photo ID:', photoId);
      
      // Check if this is a mock review (starts with '507f1f77bcf86cd7994390')
      if (reviewId.startsWith('507f1f77bcf86cd7994390')) {
        console.log('Mock review detected, deleting photo locally only');
        // For mock reviews, just call the callback to remove from UI
        if (onReviewDeleted) {
          onReviewDeleted(reviewId, photoId);
        }
      } else {
        // For real reviews, call the API
        await ReviewService.deletePhoto(reviewId, photoId);
        console.log('Photo deleted successfully from API');
        
        // Call parent callback to update the reviews list
        if (onReviewDeleted) {
          onReviewDeleted(reviewId, photoId);
        }
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert(`Failed to delete photo: ${error.message}`);
    } finally {
      setDeletingPhotoId(null);
    }
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
                <div className="review-photo-container">
                  <img 
                    src={getPhotoUrl(review.photo)} 
                    alt="Review photo" 
                    className="review-photo"
                  />
                  <button
                    className="delete-photo-btn"
                    onClick={() => handleDeletePhoto(review._id || review.id, review.photo)}
                    disabled={deletingPhotoId === review.photo}
                    title="Delete photo"
                  >
                    {deletingPhotoId === review.photo ? '⏳' : '×'}
                  </button>
                </div>
              )}
              
              {review.photoIds && review.photoIds.length > 0 && (
                <div className="review-photos">
                  {review.photoIds.map((photoId, photoIndex) => (
                    <div key={photoIndex} className="review-photo-container">
                      <img 
                        src={getPhotoUrl(photoId)} 
                        alt={`Review photo ${photoIndex + 1}`} 
                        className="review-photo"
                      />
                      <button
                        className="delete-photo-btn"
                        onClick={() => handleDeletePhoto(review._id || review.id, photoId)}
                        disabled={deletingPhotoId === photoId}
                        title="Delete photo"
                      >
                        {deletingPhotoId === photoId ? '⏳' : '×'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="review-date">
                {new Date(review.createdAt || review.timestamp).toLocaleDateString()}
              </div>
              
              <div className="review-actions">
                <button 
                  className="delete-review-btn"
                  onClick={() => handleDeleteReview(review._id || review.id)}
                  disabled={deletingReviewId === (review._id || review.id)}
                >
                  {deletingReviewId === (review._id || review.id) ? 'Deleting...' : 'Delete'}
                </button>
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