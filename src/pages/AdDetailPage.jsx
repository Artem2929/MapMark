import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StarRating from '../components/ui/StarRating';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
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
    const adId = parseInt(id);
    const categories = ['cafe', 'restaurant', 'park', 'museum'];
    const category = categories[(adId - 1) % 4];
    
    setAd({
      id: adId,
      title: `Місце ${adId}`,
      description: `Детальний опис місця ${adId}. Це чудове місце для відвідування з друзями та родиною.`,
      image: `https://picsum.photos/800/400?random=${adId}`,
      category: category,
      rating: 3 + Math.random() * 2,
      distance: Math.floor(Math.random() * 10) + 1,
      tags: ['Wi-Fi', 'Паркінг', 'Веган-френдлі'].slice(0, Math.floor(Math.random() * 3) + 1),
      location: {
        address: `вул. Тестова, ${adId}, Київ`
      },
      workingHours: "09:00 - 21:00",
      views: Math.floor(Math.random() * 2000) + 500,
      likes: Math.floor(Math.random() * 100) + 20,
      publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Користувач",
      verified: Math.random() > 0.5
    });

    setReviews([
      {
        id: 1,
        author: "Олексій",
        rating: 5,
        text: "Чудове місце! Рекомендую всім.",
        date: "2024-01-20T14:30:00Z",
        likes: 12,
        verified: true
      },
      {
        id: 2,
        author: "Анна",
        rating: 4,
        text: "Гарне місце, але можна покращити сервіс.",
        date: "2024-01-18T16:45:00Z",
        likes: 8,
        verified: false
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
    <div className="ads-item-ad-detail-page">
      <Breadcrumbs items={[
        { label: 'Головна', link: '/', icon: '🏠' },
        { label: 'Оголошення', link: '/ads', icon: '📋' },
        { label: ad.title, icon: '📍' }
      ]} />
      <div className="ads-item-ad-header">
        <h1>{ad.title}</h1>
        <div className="ads-item-ad-meta">
          <span className="ads-item-publish-date">
            Опубліковано {new Date(ad.publishedAt).toLocaleDateString()}
          </span>
          {ad.verified && <span className="ads-item-verified-badge">✓ Перевірено</span>}
        </div>
      </div>

      {/* Головне зображення */}
      <div className="ads-item-detail-image">
        <img src={ad.image} alt={ad.title} />
        <div className="ads-item-image-overlay">
          <div className="ads-item-back-btn">
            <Link to="/ads">← Назад до оголошень</Link>
          </div>
        </div>
      </div>

      <div className="ads-item-ad-content">
        <div className="ads-item-main-content">
          <div className="ads-item-ad-info">
            <div className="ads-item-ad-category">
              {ad.category === 'cafe' && '☕ Кафе'}
              {ad.category === 'restaurant' && '🍽️ Ресторан'}
              {ad.category === 'park' && '🌳 Парк'}
              {ad.category === 'museum' && '🏛️ Музей'}
            </div>
            <h1>{ad.title}</h1>
            <div className="ads-item-ad-rating-section">
              <StarRating rating={ad.rating} size="medium" />
              <span className="ads-item-rating-text">{ad.rating.toFixed(1)} з 5</span>
              <span className="ads-item-distance-text">• {ad.distance} км</span>
            </div>
          </div>

          <div className="ads-item-description-section">
            <h3>Опис</h3>
            <p>{ad.description}</p>
          </div>

          <div className="ads-item-tags-section">
            <h3>Особливості</h3>
            <div className="ads-item-tags-list">
              {ad.tags.map(tag => (
                <span key={tag} className="ads-item-detail-tag">{tag}</span>
              ))}
            </div>
          </div>

          <div className="ads-item-reviews-section">
            <h3>Відгуки ({reviews.length})</h3>
            <div className="ads-item-reviews-list">
              {sortedReviews.map(review => (
                <div key={review.id} className="ads-item-review-item">
                  <div className="ads-item-review-header">
                    <span className="ads-item-review-author">{review.author}</span>
                    {review.verified && <span className="ads-item-verified-icon">✓</span>}
                    <StarRating rating={review.rating} size="small" />
                    <span className="ads-item-review-date">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="ads-item-review-text">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ads-item-sidebar">
          <div className="ads-item-location-section">
            <h3>📍 Розташування</h3>
            <p className="ads-item-address">{ad.location.address}</p>
            <div className="ads-item-distance-info">{ad.distance} км від вас</div>
          </div>

          <div className="ads-item-working-hours">
            <h3>📞 Контакти</h3>
            <p>{ad.workingHours}</p>
            <div className="ads-item-contact-info">
              <div className="ads-item-contact-item">
                <span>📱</span>
                <a href="tel:+380501234567">+38 (050) 123-45-67</a>
              </div>
              <div className="ads-item-contact-item">
                <span>✉️</span>
                <a href="mailto:contact@example.com">contact@example.com</a>
              </div>
              <div className="ads-item-contact-item">
                <span>👤</span>
                <a href="/profile/google_user1758469031589">Профіль користувача</a>
              </div>
            </div>
          </div>

          <div className="ads-item-stats-section">
            <div className="ads-item-stat-item">
              <span className="ads-item-stat-icon">👁️</span>
              <span>{ad.views} переглядів</span>
            </div>
            <div className="ads-item-stat-item">
              <span className="ads-item-stat-icon">❤️</span>
              <span>{ad.likes} вподобань</span>
            </div>
          </div>

          <div className="ads-item-action-buttons">
            <button 
              className={`ads-item-action-btn ads-item-favorite-btn ${isFavorite ? 'active' : ''}`}
              onClick={toggleFavorite}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
            <button className="ads-item-action-btn ads-item-share-btn" onClick={shareAd}>
              📤
            </button>
            <button className="ads-item-post-bookmark-btn">
              🔖
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdDetailPage;