import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PhotoGallery from '../components/features/PhotoGallery';
import LocationMap from '../components/features/LocationMap';
import StarRating from '../components/ui/StarRating';
import ReviewForm from '../components/forms/ReviewForm';
import './AdDetailPage.css';

const AdDetailPage = () => {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadAdData();
  }, [id]);

  const loadAdData = () => {
    // Mock data - замінити на API виклик
    setAd({
      id: id,
      title: "Затишне кафе в центрі міста",
      description: "Чудове місце для роботи та відпочинку з смачною кавою та домашньою випічкою",
      photos: [
        "/images/cafe1.jpg",
        "/images/cafe2.jpg", 
        "/images/cafe3.jpg"
      ],
      location: {
        lat: 50.4501,
        lng: 30.5234,
        address: "вул. Хрещатик, 22, Київ"
      },
      rating: 4.5,
      categoryRatings: {
        price: 4.2,
        cleanliness: 4.8,
        atmosphere: 4.6,
        service: 4.3
      },
      tags: ["Фріланс", "Wi-Fi", "Веган-френдлі", "Романтика"],
      workingHours: "08:00 - 22:00",
      amenities: ["Wi-Fi", "Туалет", "Паркінг", "Веган меню"],
      views: 1247,
      likes: 89,
      publishedAt: "2024-01-15T10:30:00Z",
      author: "Марія К.",
      verified: true
    });

    setReviews([
      {
        id: 1,
        author: "Олексій",
        rating: 5,
        text: "Чудове місце! Смачна кава та затишна атмосфера.",
        date: "2024-01-20T14:30:00Z",
        likes: 12,
        verified: true
      }
    ]);
  };

  const handleAddReview = (reviewData) => {
    const newReview = {
      id: Date.now(),
      ...reviewData,
      date: new Date().toISOString(),
      likes: 0
    };
    setReviews([newReview, ...reviews]);
    setShowReviewForm(false);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const shareAd = () => {
    if (navigator.share) {
      navigator.share({
        title: ad.title,
        text: ad.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Посилання скопійовано!');
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date) - new Date(a.date);
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  if (!ad) return <div className="loading">Завантаження...</div>;

  return (
    <div className="ad-detail-page">
      <div className="ad-header">
        <h1>{ad.title}</h1>
        <div className="ad-meta">
          <span className="publish-date">
            Опубліковано {new Date(ad.publishedAt).toLocaleDateString()}
          </span>
          {ad.verified && <span className="verified-badge">✓ Перевірено</span>}
        </div>
      </div>

      <PhotoGallery photos={ad.photos} />

      <div className="ad-content">
        <div className="main-content">
          <div className="description-section">
            <p>{ad.description}</p>
          </div>

          <div className="rating-section">
            <div className="overall-rating">
              <StarRating rating={ad.rating} size="large" />
              <span className="rating-text">{ad.rating} з 5</span>
            </div>
            
            <div className="category-ratings">
              <h3>Рейтинг по категоріях</h3>
              {Object.entries(ad.categoryRatings).map(([category, rating]) => (
                <div key={category} className="category-rating">
                  <span className="category-name">{category}</span>
                  <StarRating rating={rating} />
                  <span className="rating-value">{rating}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="tags-section">
            <h3>Теги</h3>
            <div className="tags-list">
              {ad.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>

          <div className="amenities-section">
            <h3>Що є в місці</h3>
            <div className="amenities-list">
              {ad.amenities.map(amenity => (
                <div key={amenity} className="amenity-item">
                  <span className="amenity-icon">✓</span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="reviews-section">
            <div className="reviews-header">
              <h3>Відгуки ({reviews.length})</h3>
              <div className="reviews-controls">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">За новизною</option>
                  <option value="rating">За рейтингом</option>
                  <option value="popular">За популярністю</option>
                </select>
                <button 
                  className="add-review-btn"
                  onClick={() => setShowReviewForm(true)}
                >
                  Додати відгук
                </button>
              </div>
            </div>

            {showReviewForm && (
              <ReviewForm 
                onSubmit={handleAddReview}
                onCancel={() => setShowReviewForm(false)}
              />
            )}

            <div className="reviews-list">
              {sortedReviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="review-author">{review.author}</span>
                    {review.verified && <span className="verified-icon">✓</span>}
                    <StarRating rating={review.rating} />
                    <span className="review-date">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="review-text">{review.text}</p>
                  <div className="review-actions">
                    <button className="like-btn">👍 {review.likes}</button>
                    <button className="report-btn">Поскаржитись</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sidebar">
          <div className="location-section">
            <h3>Розташування</h3>
            <LocationMap 
              location={ad.location}
              showRouteButton={true}
            />
            <p className="address">{ad.location.address}</p>
          </div>

          <div className="working-hours">
            <h3>Час роботи</h3>
            <p>{ad.workingHours}</p>
          </div>

          <div className="stats-section">
            <div className="stat-item">
              <span className="stat-icon">👁️</span>
              <span>{ad.views} переглядів</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">❤️</span>
              <span>{ad.likes} вподобань</span>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className={`favorite-btn ${isFavorite ? 'active' : ''}`}
              onClick={toggleFavorite}
            >
              {isFavorite ? '❤️' : '🤍'} Улюблене
            </button>
            <button className="share-btn" onClick={shareAd}>
              📤 Поділитись
            </button>
          </div>
        </div>
      </div>

      <div className="sticky-navigation">
        <button className="nav-btn route-btn">
          🗺️ Як дістатись
        </button>
        <button 
          className="nav-btn review-btn"
          onClick={() => setShowReviewForm(true)}
        >
          ✍️ Залишити відгук
        </button>
      </div>
    </div>
  );
};

export default AdDetailPage;