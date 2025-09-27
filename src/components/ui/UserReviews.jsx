import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import './UserReviews.css';

const UserReviews = ({ userId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/user/${userId}/reviews`);
        const data = await response.json();
        if (data.success) {
          setReviews(data.data);
        }
      } catch (error) {
        console.error('Error fetching user reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserReviews();
    }
  }, [userId]);

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'high') return review.rating >= 4;
    if (filter === 'low') return review.rating <= 2;
    return true;
  });

  if (loading) {
    return (
      <div className="user-reviews-loading">
        <div className="loading-spinner"></div>
        <p>Завантаження відгуків...</p>
      </div>
    );
  }

  return (
    <div className="user-reviews">
      <div className="user-reviews-header">
        <h3>Мої відгуки ({reviews.length})</h3>
        <div className="reviews-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Всі
          </button>
          <button 
            className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            Високі оцінки
          </button>
          <button 
            className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
            onClick={() => setFilter('low')}
          >
            Низькі оцінки
          </button>
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="no-reviews">
          <div className="no-reviews-icon">📝</div>
          <p>Відгуків поки що немає</p>
          <Link to="/discover-places" className="add-review-btn">
            Додати перший відгук
          </Link>
        </div>
      ) : (
        <div className="reviews-grid">
          {filteredReviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="review-location">
                  📍 {review.location || 'Невідоме місце'}
                </div>
                <StarRating rating={review.rating} readonly size="small" />
              </div>
              
              <div className="review-content">
                <p className="review-text">{review.text}</p>
              </div>
              
              <div className="review-footer">
                <div className="review-date">
                  {new Date(review.createdAt).toLocaleDateString('uk-UA')}
                </div>
                <div className="review-actions">
                  <button className="edit-review-btn">✏️</button>
                  <button className="delete-review-btn">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserReviews;