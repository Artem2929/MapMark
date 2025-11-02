import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PostCard.css';

const PostCard = ({ post, onLike, onComment, onShare }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'щойно';
    if (diffInMinutes < 60) return `${diffInMinutes} хв тому`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} год тому`;
    return `${Math.floor(diffInMinutes / 1440)} дн тому`;
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(post.id);
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
            className={`post-card__action-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <span className="post-card__icon">❤️</span>
            <span className="post-card__count">{post.stats.likes + (isLiked ? 1 : 0)}</span>
          </button>
          <button 
            className="post-card__action-btn"
            onClick={() => setShowComments(!showComments)}
          >
            <span className="post-card__icon">💬</span>
            <span className="post-card__count">{post.stats.comments}</span>
          </button>
          <button 
            className="post-card__action-btn"
            onClick={handleShare}
          >
            <span className="post-card__icon">📤</span>
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