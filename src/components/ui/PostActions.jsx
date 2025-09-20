import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './PostActions.css';

const PostActions = ({ initialLikes = 0, initialDislikes = 0, initialComments = [] }) => {
  const { t } = useTranslation();
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [animatingLike, setAnimatingLike] = useState(false);
  const [animatingDislike, setAnimatingDislike] = useState(false);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('time.justNow', 'щойно');
    if (diffInMinutes < 60) return t('time.minutesAgo', `${diffInMinutes} хв тому`);
    if (diffInMinutes < 1440) return t('time.hoursAgo', `${Math.floor(diffInMinutes / 60)} год тому`);
    return t('time.daysAgo', `${Math.floor(diffInMinutes / 1440)} дн тому`);
  };

  const handleLike = () => {
    setAnimatingLike(true);
    setTimeout(() => setAnimatingLike(false), 300);
    
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      if (isDisliked) {
        setDislikes(dislikes - 1);
        setIsDisliked(false);
      }
      setLikes(likes + 1);
      setIsLiked(true);
    }
  };

  const handleDislike = () => {
    setAnimatingDislike(true);
    setTimeout(() => setAnimatingDislike(false), 300);
    
    if (isDisliked) {
      setDislikes(dislikes - 1);
      setIsDisliked(false);
    } else {
      if (isLiked) {
        setLikes(likes - 1);
        setIsLiked(false);
      }
      setDislikes(dislikes + 1);
      setIsDisliked(true);
    }
  };

  const handleComment = () => {
    setShowCommentInput(!showCommentInput);
  };

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: Date.now(),
        text: commentText.trim(),
        timestamp: new Date().toISOString(),
        timeAgo: t('time.justNow', 'щойно')
      };
      setComments([newComment, ...comments]);
      setCommentText('');
      setShowCommentInput(false);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  const handleDeleteComment = (commentId) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  return (
    <div className="post-actions-container">
      <div className="post-actions">
        <div className="post-action-buttons">
          <button 
            className={`post-action-btn like-btn ${isLiked ? 'active' : ''} ${animatingLike ? 'animating' : ''}`}
            onClick={handleLike}
            aria-label={`Лайк (${likes})`}
          >
            <span className="post-icon" aria-hidden="true">❤️</span>
            <span className="post-count">{likes}</span>
          </button>
          
          <button 
            className={`post-action-btn dislike-btn ${isDisliked ? 'active' : ''} ${animatingDislike ? 'animating' : ''}`}
            onClick={handleDislike}
            aria-label={`Дизлайк (${dislikes})`}
          >
            <span className="post-icon" aria-hidden="true">👎</span>
            <span className="post-count">{dislikes}</span>
          </button>
          
          <button 
            className="post-action-btn comment-btn"
            onClick={handleComment}
            aria-label={`Коментарі (${comments.length})`}
          >
            <span className="post-icon" aria-hidden="true">💬</span>
            <span className="post-count">{comments.length}</span>
          </button>
        </div>
        
        <button 
          className="post-bookmark-btn"
          aria-label="Додати в закладки"
        >
          <span aria-hidden="true">🔖</span>
        </button>
      </div>

      {showCommentInput && (
        <div className="post-comment-input-section slide-in">
          <div className="post-comment-input-container">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Напишіть коментар..."
              maxLength={500}
              className="post-comment-input"
              aria-label="Поле для введення коментаря"
            />
            <div className="post-comment-controls">
              <span className="post-char-count">{commentText.length}/500</span>
              <button 
                className="post-submit-btn"
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                aria-label="Надіслати коментар"
              >
                Надіслати
              </button>
            </div>
          </div>
        </div>
      )}

      {comments.length > 0 && (
        <div className="post-comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="post-comment-item fade-in">
              <div className="post-comment-header">
                <div className="post-comment-text">{comment.text}</div>
                <button 
                  className="post-delete-comment-btn"
                  onClick={() => handleDeleteComment(comment.id)}
                  aria-label="Видалити коментар"
                >
                  ×
                </button>
              </div>
              <div className="post-comment-timestamp">{getTimeAgo(comment.timestamp)}</div>
            </div>
          ))}
        </div>
      )}

      {showAlert && (
        <div className="post-comment-alert slide-in">
          Коментар додано ✓
        </div>
      )}
    </div>
  );
};

export default PostActions;