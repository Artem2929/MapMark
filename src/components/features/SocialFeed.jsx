import React, { useState, useEffect, useRef } from 'react';
import './SocialFeed.css';

const SocialFeed = ({ userLocation, friends = [], onClose }) => {
  const [feedItems, setFeedItems] = useState([]);
  const [filter, setFilter] = useState('all'); // all, friends, nearby, trending
  const [isLoading, setIsLoading] = useState(false);
  const feedRef = useRef(null);

  useEffect(() => {
    loadFeedItems();
  }, [filter, userLocation]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (feedRef.current && !feedRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const loadFeedItems = async () => {
    setIsLoading(true);
    
    // Mock feed data - replace with actual API
    const mockFeedItems = [
      {
        id: 1,
        type: 'review',
        user: { name: 'Олена К.', avatar: '👩', level: 5, badges: ['🏆', '📸'] },
        place: { name: 'Кафе "Львівська кава"', category: 'Кафе', rating: 4.8 },
        content: 'Неймовірна атмосфера та найкраща кава в місті! 😍',
        photos: ['https://via.placeholder.com/300x200'],
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        likes: 15,
        comments: 3,
        distance: 0.5,
        isLiked: false,
        tags: ['кава', 'атмосфера', 'рекомендую']
      },
      {
        id: 2,
        type: 'photo',
        user: { name: 'Максим П.', avatar: '👨', level: 3, badges: ['📸'] },
        place: { name: 'Парк Шевченка', category: 'Парк', rating: 4.6 },
        content: 'Чудовий ранок для пробіжки! 🏃‍♂️',
        photos: ['https://via.placeholder.com/300x200', 'https://via.placeholder.com/300x200'],
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        likes: 8,
        comments: 1,
        distance: 1.2,
        isLiked: true,
        tags: ['спорт', 'ранок', 'природа']
      },
      {
        id: 3,
        type: 'achievement',
        user: { name: 'Анна С.', avatar: '👩‍🦰', level: 7, badges: ['👑', '🏆', '📸'] },
        achievement: { name: 'Експерт відгуків', icon: '🏆', description: '100 відгуків написано!' },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        likes: 25,
        comments: 8,
        isLiked: false
      },
      {
        id: 4,
        type: 'checkin',
        user: { name: 'Дмитро Л.', avatar: '👨‍💼', level: 4, badges: ['🗺️'] },
        place: { name: 'Ресторан "Bernardazzi"', category: 'Ресторан', rating: 4.9 },
        content: 'Святкуємо річницю в найкращому ресторані! 🥂',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        likes: 12,
        comments: 5,
        distance: 2.1,
        isLiked: false,
        tags: ['святкування', 'річниця', 'романтика']
      }
    ];

    // Filter based on selected filter
    let filteredItems = mockFeedItems;
    
    if (filter === 'friends') {
      filteredItems = mockFeedItems.filter(item => 
        friends.includes(item.user.name)
      );
    } else if (filter === 'nearby') {
      filteredItems = mockFeedItems.filter(item => 
        item.distance && item.distance <= 1
      );
    } else if (filter === 'trending') {
      filteredItems = mockFeedItems.filter(item => 
        item.likes >= 10
      );
    }

    setTimeout(() => {
      setFeedItems(filteredItems);
      setIsLoading(false);
    }, 500);
  };

  const handleLike = (itemId) => {
    setFeedItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              isLiked: !item.isLiked,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1
            }
          : item
      )
    );
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} хв тому`;
    if (hours < 24) return `${hours} год тому`;
    return `${days} дн тому`;
  };

  const renderFeedItem = (item) => {
    switch (item.type) {
      case 'review':
      case 'photo':
      case 'checkin':
        return (
          <div key={item.id} className="social-feed-item">
            <div className="social-feed-header">
              <div className="social-feed-user-info">
                <div className="social-feed-user-avatar">{item.user.avatar}</div>
                <div className="social-feed-user-details">
                  <div className="social-feed-user-name">
                    {item.user.name}
                    <span className="social-feed-user-level">Рівень {item.user.level}</span>
                  </div>
                  <div className="social-feed-user-badges">
                    {item.user.badges.map((badge, index) => (
                      <span key={index} className="social-feed-badge">{badge}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="social-feed-time">{formatTimeAgo(item.timestamp)}</div>
            </div>

            {item.place && (
              <div className="social-feed-place-info">
                <span className="social-feed-place-name">📍 {item.place.name}</span>
                <span className="social-feed-place-rating">⭐ {item.place.rating}</span>
                {item.distance && (
                  <span className="social-feed-place-distance">📏 {item.distance}км</span>
                )}
              </div>
            )}

            <div className="social-feed-content">
              <p>{item.content}</p>
              
              {item.photos && item.photos.length > 0 && (
                <div className={`social-feed-photo-grid ${item.photos.length > 1 ? 'multiple' : 'single'}`}>
                  {item.photos.map((photo, index) => (
                    <img key={index} src={photo} alt="Review photo" />
                  ))}
                </div>
              )}

              {item.tags && (
                <div className="social-feed-tags">
                  {item.tags.map((tag, index) => (
                    <span key={index} className="social-feed-tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="social-feed-actions">
              <button 
                className={`social-feed-action-btn social-feed-like-btn ${item.isLiked ? 'liked' : ''}`}
                onClick={() => handleLike(item.id)}
              >
                {item.isLiked ? '❤️' : '🤍'} {item.likes}
              </button>
              <button className="social-feed-action-btn social-feed-comment-btn">
                💬 {item.comments}
              </button>
              <button className="social-feed-action-btn social-feed-share-btn">
                📤 Поділитися
              </button>
            </div>
          </div>
        );

      case 'achievement':
        return (
          <div key={item.id} className="social-feed-item social-feed-achievement-item">
            <div className="social-feed-header">
              <div className="social-feed-user-info">
                <div className="social-feed-user-avatar">{item.user.avatar}</div>
                <div className="social-feed-user-details">
                  <div className="social-feed-user-name">
                    {item.user.name}
                    <span className="social-feed-user-level">Рівень {item.user.level}</span>
                  </div>
                </div>
              </div>
              <div className="social-feed-time">{formatTimeAgo(item.timestamp)}</div>
            </div>

            <div className="social-feed-achievement-content">
              <div className="social-feed-achievement-icon">{item.achievement.icon}</div>
              <div className="social-feed-achievement-details">
                <h4>Нове досягнення!</h4>
                <h3>{item.achievement.name}</h3>
                <p>{item.achievement.description}</p>
              </div>
            </div>

            <div className="social-feed-actions">
              <button 
                className={`social-feed-action-btn social-feed-like-btn ${item.isLiked ? 'liked' : ''}`}
                onClick={() => handleLike(item.id)}
              >
                {item.isLiked ? '❤️' : '🤍'} {item.likes}
              </button>
              <button className="social-feed-action-btn social-feed-comment-btn">
                💬 {item.comments}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="social-feed" ref={feedRef}>
      <div className="social-feed-header-controls">
        <h2>📱 Соціальна стрічка</h2>
        <button className="social-feed-close-btn" onClick={onClose}>
          ✕
        </button>
        
        <div className="social-feed-filters">
          <div className="social-feed-filters-wrapper">
            <button 
              className={`social-feed-filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Всі
            </button>
            <button 
              className={`social-feed-filter-btn ${filter === 'friends' ? 'active' : ''}`}
              onClick={() => setFilter('friends')}
            >
              👥 Друзі
            </button>
            <button 
              className={`social-feed-filter-btn ${filter === 'nearby' ? 'active' : ''}`}
              onClick={() => setFilter('nearby')}
            >
              📍 Поблизу
            </button>
            <button 
              className={`social-feed-filter-btn ${filter === 'trending' ? 'active' : ''}`}
              onClick={() => setFilter('trending')}
            >
              🔥 Популярне
            </button>
            <button 
              className={`social-feed-filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Всі
            </button>
            <button 
              className={`social-feed-filter-btn ${filter === 'friends' ? 'active' : ''}`}
              onClick={() => setFilter('friends')}
            >
              👥 Друзі
            </button>
            <button 
              className={`social-feed-filter-btn ${filter === 'nearby' ? 'active' : ''}`}
              onClick={() => setFilter('nearby')}
            >
              📍 Поблизу
            </button>
            <button 
              className={`social-feed-filter-btn ${filter === 'trending' ? 'active' : ''}`}
              onClick={() => setFilter('trending')}
            >
              🔥 Популярне
            </button>
          </div>
        </div>
      </div>

      <div className="social-feed-content">
        {isLoading ? (
          <div className="social-feed-loading-state">
            <div className="social-feed-loading-spinner">⏳</div>
            <p>Завантаження стрічки...</p>
          </div>
        ) : feedItems.length > 0 ? (
          feedItems.map(renderFeedItem)
        ) : (
          <div className="social-feed-empty-state">
            <div className="social-feed-empty-icon">📭</div>
            <h3>Стрічка порожня</h3>
            <p>Поки що немає активності для відображення</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialFeed;