import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SavedPosts.css';

const SavedPosts = () => {
  const navigate = useNavigate();
  
  // Отримуємо збережені пости з localStorage або стану
  const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');

  const handleBackClick = () => {
    navigate('/discover-places');
  };

  return (
    <div className="saved-posts-page">
      <div className="saved-posts-container">
        <div className="saved-posts-header">
          <button className="back-btn" onClick={handleBackClick}>
            <span>←</span>
          </button>
          <h1 className="saved-posts-title">Збережені пости</h1>
          <div className="saved-posts-count">{savedPosts.length} постів</div>
        </div>

        {savedPosts.length === 0 ? (
          <div className="empty-saved">
            <div className="empty-icon">🔖</div>
            <h2>Немає збережених постів</h2>
            <p>Коли ви збережете пости, вони з'являться тут</p>
            <button className="explore-btn" onClick={handleBackClick}>
              Досліджувати місця
            </button>
          </div>
        ) : (
          <div className="saved-posts-grid">
            {savedPosts.map(post => (
              <div key={post.id} className="saved-post-item">
                <div className="saved-post-image-container">
                  <img src={post.image} alt={post.title} className="saved-post-image" />
                  <div className="saved-post-overlay">
                    <div className="saved-post-stats">
                      <span className="stat-item">
                        <span>❤️</span>
                        <span>{post.likes}</span>
                      </span>
                      <span className="stat-item">
                        <span>💬</span>
                        <span>{post.comments}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="saved-post-info">
                  <h3 className="saved-post-title">{post.title}</h3>
                  <div className="saved-post-rating">
                    <span className="rating-stars">⭐</span>
                    <span>{post.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPosts;