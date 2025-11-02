import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Comments from '../components/ui/Comments';
import './PostDetail.css';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localStats, setLocalStats] = useState(null);
  const [userReaction, setUserReaction] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/posts/${postId}`);
      const data = await response.json();

      if (data.success) {
        setPost(data.post);
        setLocalStats(data.post.stats);
      } else {
        setError(data.error || 'Пост не знайдено');
      }
    } catch (err) {
      setError('Помилка завантаження');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (type) => {
    if (isUpdating || !post) return;
    
    const previousStats = { ...localStats };
    const previousReaction = userReaction;
    
    // Оптимістичне оновлення UI
    let newStats = { ...localStats };
    let newReaction = type;
    
    if (userReaction === type) {
      newReaction = null;
      if (type === 'like') {
        newStats.likes = Math.max(0, newStats.likes - 1);
      } else if (type === 'dislike') {
        newStats.dislikes = Math.max(0, newStats.dislikes - 1);
      }
    } else {
      if (userReaction === 'like') {
        newStats.likes = Math.max(0, newStats.likes - 1);
      } else if (userReaction === 'dislike') {
        newStats.dislikes = Math.max(0, newStats.dislikes - 1);
      }
      
      if (type === 'like') {
        newStats.likes += 1;
      } else if (type === 'dislike') {
        newStats.dislikes += 1;
      }
    }
    
    setLocalStats(newStats);
    setUserReaction(newReaction);
    setIsUpdating(true);
    
    try {
      const response = await fetch(`http://localhost:3001/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'temp-user-id',
          type: newReaction
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setLocalStats(data.stats);
        setUserReaction(data.userReaction);
      }
    } catch (error) {
      setLocalStats(previousStats);
      setUserReaction(previousReaction);
      console.error('Error updating reaction:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.content.substring(0, 100),
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Посилання скопійовано!');
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'щойно';
    if (diffInMinutes < 60) return `${diffInMinutes} хв тому`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} год тому`;
    return `${Math.floor(diffInMinutes / 1440)} дн тому`;
  };

  if (loading) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-container">
          <div className="post-detail-loading">
            <div className="spinner"></div>
            <p>Завантаження посту...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-container">
          <div className="post-detail-error">
            <h2>Пост не знайдено</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/discover-places')} className="back-btn">
              Повернутися до стрічки
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-page">
      <div className="post-detail-container">
        {/* Навігація */}
        <div className="post-detail-nav">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Назад
          </button>
          <Link to="/discover-places" className="home-link">
            Стрічка постів
          </Link>
        </div>

        {/* Основний контент */}
        <div className="post-detail-content">
          {/* Заголовок посту */}
          <div className="post-detail-header">
            <Link to={`/profile/${post.author.id}`} className="post-detail-author">
              <div className="post-detail-avatar">
                {post.author.avatar ? (
                  <img src={post.author.avatar} alt={post.author.name} />
                ) : (
                  <div className="post-detail-avatar-placeholder">
                    {post.author.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="post-detail-author-info">
                <h3 className="post-detail-author-name">{post.author.name}</h3>
                <span className="post-detail-time">{getTimeAgo(post.createdAt)}</span>
                {post.location && (
                  <div className="post-detail-location">
                    <span className="location-icon">📍</span>
                    <span>{post.location}</span>
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Зображення */}
          {post.images && post.images.length > 0 && (
            <div className="post-detail-media">
              <img 
                src={post.images[0].url} 
                alt="Post content" 
                className="post-detail-image"
              />
            </div>
          )}

          {/* Контент */}
          <div className="post-detail-text">
            <p>{post.content}</p>
          </div>

          {/* Дії */}
          <div className="post-detail-actions">
            <div className="post-detail-action-buttons">
              <button 
                className={`post-detail-action-btn like-btn ${userReaction === 'like' ? 'active' : ''}`}
                onClick={() => handleReaction('like')}
                disabled={isUpdating}
              >
                <span className="action-icon">👍</span>
                <span className="action-count">{localStats?.likes || 0}</span>
              </button>
              <button 
                className={`post-detail-action-btn dislike-btn ${userReaction === 'dislike' ? 'active' : ''}`}
                onClick={() => handleReaction('dislike')}
                disabled={isUpdating}
              >
                <span className="action-icon">👎</span>
                <span className="action-count">{localStats?.dislikes || 0}</span>
              </button>
              <button 
                className="post-detail-action-btn comment-btn"
                onClick={() => document.querySelector('.comments-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="action-icon">💬</span>
                <span className="action-count">{localStats?.comments || 0}</span>
              </button>
              <button 
                className="post-detail-action-btn share-btn"
                onClick={handleShare}
              >
                <span className="action-icon">↗️</span>
              </button>
            </div>
          </div>

          {/* Коментарі */}
          <Comments postId={post.id} initialCount={localStats?.comments || 0} />
        </div>
      </div>
    </div>
  );
};

export default PostDetail;