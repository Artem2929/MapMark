import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PostCard.css';

const PostCard = ({ post, onReaction, onComment, onShare }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localStats, setLocalStats] = useState(post.stats);
  const [userReaction, setUserReaction] = useState(null); // 'like', 'dislike', або null
  const [isUpdating, setIsUpdating] = useState(false);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'щойно';
    if (diffInMinutes < 60) return `${diffInMinutes} хв тому`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} год тому`;
    return `${Math.floor(diffInMinutes / 1440)} дн тому`;
  };

  const handleReaction = async (type) => {
    if (isUpdating) return;
    
    const previousStats = { ...localStats };
    const previousReaction = userReaction;
    
    // Оптимістичне оновлення UI
    let newStats = { ...localStats };
    let newReaction = type;
    
    // Якщо клікнули на ту ж кнопку - видаляємо реакцію
    if (userReaction === type) {
      newReaction = null;
      if (type === 'like') {
        newStats.likes = Math.max(0, newStats.likes - 1);
      } else if (type === 'dislike') {
        newStats.dislikes = Math.max(0, newStats.dislikes - 1);
      }
    } else {
      // Змінюємо реакцію
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
      const response = await onReaction?.(post.id, newReaction);
      if (response?.success) {
        // Підтверджуємо дані з сервера
        setLocalStats(response.stats);
        setUserReaction(response.userReaction);
      }
    } catch (error) {
      // Відкатуємо зміни при помилці
      setLocalStats(previousStats);
      setUserReaction(previousReaction);
      console.error('Error updating reaction:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComment = () => {
    if (commentText.trim()) {
      onComment?.(post.id, commentText);
      setCommentText('');
    }
  };

  const handleShare = () => {
    onShare?.(post.id);
  };

  return (
    <div className="post-card">
      <div className="post-card__header">
        <Link to={`/profile/${post.author.id}`} className="post-card__author">
          <div className="post-card__avatar">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt={post.author.name} />
            ) : (
              <div className="post-card__avatar-placeholder">
                {post.author.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="post-card__author-info">
            <span className="post-card__author-name">{post.author.name}</span>
            <span className="post-card__time">{getTimeAgo(post.createdAt)}</span>
          </div>
        </Link>
        <button className="post-card__menu">⋯</button>
      </div>

      {post.image && (
        <div className="post-card__media">
          <img src={post.image} alt={post.title} className="post-card__image" />
        </div>
      )}

      <div className="post-card__content">
        <h3 className="post-card__title">{post.title}</h3>
        <p className="post-card__description">{post.description}</p>
        {post.location && (
          <div className="post-card__location">
            <span className="post-card__location-icon">📍</span>
            <span className="post-card__location-text">{post.location}</span>
          </div>
        )}
      </div>

      <div className="post-card__actions">
        <div className="post-card__action-buttons">
          <button 
            className={`post-card__action-btn like-btn ${userReaction === 'like' ? 'active' : ''}`}
            onClick={() => handleReaction('like')}
            disabled={isUpdating}
          >
            <span className="post-card__icon">👍</span>
            <span className="post-card__count">{localStats.likes}</span>
          </button>
          <button 
            className={`post-card__action-btn dislike-btn ${userReaction === 'dislike' ? 'active' : ''}`}
            onClick={() => handleReaction('dislike')}
            disabled={isUpdating}
          >
            <span className="post-card__icon">👎</span>
            <span className="post-card__count">{localStats.dislikes}</span>
          </button>
          <button 
            className="post-card__action-btn comment-btn"
            onClick={() => setShowComments(!showComments)}
          >
            <span className="post-card__icon">💬</span>
            <span className="post-card__count">{localStats.comments}</span>
          </button>
          <button 
            className="post-card__action-btn share-btn"
            onClick={handleShare}
          >
            <span className="post-card__icon">↗️</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="post-card__comments">
          <div className="post-card__comment-form">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Напишіть коментар..."
              maxLength={500}
              className="post-card__comment-input"
            />
            <div className="post-card__comment-controls">
              <span className="post-card__char-count">{commentText.length}/500</span>
              <button 
                className="post-card__submit-btn"
                onClick={handleComment}
                disabled={!commentText.trim()}
              >
                Надіслати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;