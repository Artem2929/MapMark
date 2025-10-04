import React, { useEffect, useRef, useState } from 'react';
import ReviewService from '../../services/reviewService';
import './ReviewsList.css';

const ReviewsList = ({ marker, onClose }) => {
  const reviewsListRef = useRef(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  
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
  
  useEffect(() => {
    // Add class to body when reviews list is open
    document.body.classList.add('reviews-list-open');
    
    return () => {
      document.body.classList.remove('reviews-list-open');
    };
  }, []);
  
  const handleLike = async (reviewId) => {
    try {
      await ReviewService.likeReview(reviewId);
      setReviews(prev => prev.map(review => 
        review._id === reviewId 
          ? { ...review, likes: (review.likes || 0) + 1, userLiked: true }
          : review
      ));
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  const handleDislike = async (reviewId) => {
    try {
      await ReviewService.dislikeReview(reviewId);
      setReviews(prev => prev.map(review => 
        review._id === reviewId 
          ? { ...review, dislikes: (review.dislikes || 0) + 1, userDisliked: true }
          : review
      ));
    } catch (error) {
      console.error('Error disliking review:', error);
    }
  };

  const toggleComments = (reviewId) => {
    setExpandedComments(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const handleCommentSubmit = async (reviewId) => {
    const comment = newComments[reviewId]?.trim();
    if (!comment) return;

    try {
      setSubmittingComment(prev => ({ ...prev, [reviewId]: true }));
      const newComment = await ReviewService.addComment(reviewId, comment);
      
      setReviews(prev => prev.map(review => 
        review._id === reviewId 
          ? { ...review, comments: [...(review.comments || []), newComment] }
          : review
      ));
      
      setNewComments(prev => ({ ...prev, [reviewId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [reviewId]: false }));
    }
  };

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
            {[1, 2, 3].map(i => (
              <div key={i} className="reviews-list-loading-skeleton">
                <div className="reviews-list-skeleton-avatar"></div>
                <div className="reviews-list-skeleton-content">
                  <div className="reviews-list-skeleton-line"></div>
                  <div className="reviews-list-skeleton-line"></div>
                  <div className="reviews-list-skeleton-line"></div>
                </div>
              </div>
            ))}
          </div>
        ) : markerReviews.length > 0 ? (
          markerReviews.map((review, index) => (
            <div key={review._id || review.id || index} className="reviews-list-item">
              <div className="reviews-list-header-info">
                <div className="reviews-list-user-info">
                  <div className="reviews-list-user-avatar"></div>
                  <div className="reviews-list-user-details">
                    <div className="reviews-list-user-name">{review.username || 'Anonymous User'}</div>
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
              
              <div className="reviews-list-actions">
                <button 
                  className={`action-btn like-btn ${review.userLiked ? 'active' : ''}`}
                  onClick={() => handleLike(review._id)}
                  title="Подобається"
                >
                  👍
                  {(review.likes || 0) > 0 && <span className="count">{review.likes}</span>}
                </button>
                <button 
                  className={`action-btn dislike-btn ${review.userDisliked ? 'active' : ''}`}
                  onClick={() => handleDislike(review._id)}
                  title="Не подобається"
                >
                  👎
                  {(review.dislikes || 0) > 0 && <span className="count">{review.dislikes}</span>}
                </button>
                <button 
                  className="action-btn comment-btn"
                  onClick={() => toggleComments(review._id)}
                  title="Коментарі"
                >
                  💬
                  {(review.comments?.length || 0) > 0 && <span className="count">{review.comments.length}</span>}
                </button>
              </div>
              
              {expandedComments[review._id] && (
                <div className="comments-section">
                  <div className="comments-list">
                    {review.comments?.map((comment, commentIndex) => (
                      <div key={commentIndex} className="comment-item">
                        <div className="comment-avatar">👤</div>
                        <div className="comment-content">
                          <div className="comment-author">{comment.username || 'Anonymous'}</div>
                          <div className="comment-text">{comment.text}</div>
                          <div className="comment-time">{new Date(comment.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    )) || []}
                  </div>
                  
                  <div className="add-comment">
                    <input
                      type="text"
                      placeholder="Додати коментар..."
                      value={newComments[review._id] || ''}
                      onChange={(e) => setNewComments(prev => ({
                        ...prev,
                        [review._id]: e.target.value
                      }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleCommentSubmit(review._id);
                        }
                      }}
                    />
                    <button 
                      onClick={() => handleCommentSubmit(review._id)}
                      disabled={submittingComment[review._id] || !newComments[review._id]?.trim()}
                    >
                      {submittingComment[review._id] ? '...' : '➤'}
                    </button>
                  </div>
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