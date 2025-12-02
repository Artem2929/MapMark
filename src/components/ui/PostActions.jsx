import React, { useState, memo, useCallback } from 'react';
import { classNames } from '../../utils/classNames';
import { useTranslation } from 'react-i18next';
import './PostActions.css';

const PostActions = memo(({  initialLikes = 0, initialDislikes = 0, initialComments = []  }) => {
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            <span className="post-count">{likes}</span>
          </button>
          
          <button 
            className={`post-action-btn dislike-btn ${isDisliked ? 'active' : ''} ${animatingDislike ? 'animating' : ''}`}
            onClick={handleDislike}
            aria-label={`Дизлайк (${dislikes})`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
            </svg>
            <span className="post-count">{dislikes}</span>
          </button>
          
          <button 
            className="post-action-btn comment-btn"
            onClick={handleComment}
            aria-label={`Коментарі (${comments.length})`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
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
                  onClick={useCallback(() => handleDeleteComment(comment.id), [])}
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
});

PostActions.displayName = 'PostActions';

export default PostActions;