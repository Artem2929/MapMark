import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/apiClient.js';
import './Comments.css';

const Comments = ({ postId }) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const [commentReactions, setCommentReactions] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'щойно';
    if (diffInMinutes < 60) return `${diffInMinutes} хв тому`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} год тому`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} дн тому`;
    return `${Math.floor(diffInMinutes / 10080)} тиж тому`;
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const data = await apiClient.get(`/posts/${postId}/comments`);
      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const data = await apiClient.post(`/posts/${postId}/comments`, {
        content: newComment.trim()
      });
      
      if (data.success) {
        // Перезавантажуємо коментарі з сервера
        fetchComments();
        setNewComment('');

      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleCommentReaction = async (commentId, reactionType) => {
    const currentReaction = commentReactions[commentId];
    const newReaction = currentReaction === reactionType ? null : reactionType;
    
    // Оптимістичне оновлення
    setCommentReactions(prev => ({
      ...prev,
      [commentId]: newReaction
    }));

    setComments(prev => prev.map(comment => {
      if (comment._id === commentId) {
        const updatedComment = { ...comment };
        
        // Видаляємо попередню реакцію
        if (currentReaction === 'like') {
          updatedComment.likes = Math.max(0, (updatedComment.likes || 0) - 1);
        } else if (currentReaction === 'dislike') {
          updatedComment.dislikes = Math.max(0, (updatedComment.dislikes || 0) - 1);
        }
        
        // Додаємо нову реакцію
        if (newReaction === 'like') {
          updatedComment.likes = (updatedComment.likes || 0) + 1;
        } else if (newReaction === 'dislike') {
          updatedComment.dislikes = (updatedComment.dislikes || 0) + 1;
        }
        
        return updatedComment;
      }
      return comment;
    }));

    try {
      const response = await fetch(`http://localhost:3001/api/posts/${postId}/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: newReaction })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error updating comment reaction:', error);
      // Відкат при помилці
      setCommentReactions(prev => ({
        ...prev,
        [commentId]: currentReaction
      }));
    }
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;

    try {
      const data = await apiClient.post(`/posts/${postId}/comments/${commentId}/replies`, {
        content: replyText.trim()
      });
      
      if (data.success) {
        // Оновлюємо коментар з новою відповіддю
        setComments(prev => prev.map(comment => 
          comment._id === commentId 
            ? { ...comment, replies: [...(comment.replies || []), data.reply] }
            : comment
        ));
        setReplyText('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const displayedComments = comments.slice(0, 3);

  // Закриваємо форму відповіді при кліку поза нею
  const handleClickOutside = (e) => {
    if (!e.target.closest('.reply-form') && !e.target.closest('.comment-reply-btn')) {
      setReplyingTo(null);
      setReplyText('');
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="comments-section">
      {/* Список коментарів */}
      {displayedComments.length > 0 && (
        <div className="comments-list">
          {displayedComments.map((comment) => (
          <div key={comment._id} className="comment-item">
            <div className="comment-avatar" onClick={() => navigate(`/profile/${comment.author._id}`)}>
              {comment.author.avatar ? (
                <img src={`http://localhost:3001${comment.author.avatar}`} alt={comment.author.name} />
              ) : (
                <div className="comment-avatar-placeholder">
                  {comment.author.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="comment-content">
              <div className="comment-main">
                <div className="comment-author">{comment.author.name}</div>
                <div className="comment-text">{comment.content}</div>
              </div>
              <div className="comment-actions">
                <span className="comment-time">{getTimeAgo(comment.createdAt)}</span>
                <button 
                  className={`comment-like-btn ${commentReactions[comment._id] === 'like' ? 'liked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCommentReaction(comment._id, 'like');
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                  </svg>
                  <span>{comment.likes || 0}</span>
                </button>
                <button 
                  className={`comment-like-btn ${commentReactions[comment._id] === 'dislike' ? 'disliked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCommentReaction(comment._id, 'dislike');
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                  </svg>
                  <span>{comment.dislikes || 0}</span>
                </button>
              </div>
            </div>

          </div>
          ))}
        </div>
      )}

      {/* Форма додавання коментаря */}
      <form onSubmit={replyingTo ? (e) => { e.preventDefault(); handleReplySubmit(replyingTo); } : handleSubmit} className="add-comment">
        <div className="comment-input-wrapper">
          <textarea
            value={replyingTo ? replyText : newComment}
            onChange={(e) => {
              const value = e.target.value;
              if (replyingTo) {
                setReplyText(value);
              } else {
                setNewComment(value);
              }
              // Автоматичне розширення
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (replyingTo) {
                  handleReplySubmit(replyingTo);
                } else {
                  handleSubmit(e);
                }
              }
            }}
            placeholder={replyingTo ? `Відповісти ${comments.find(c => c._id === replyingTo)?.author.name}...` : "Додати коментар..."}
            className="comment-input"
            rows="1"
          />
        </div>
        <button 
          type="submit" 
          className="send-btn"
          disabled={!(replyingTo ? replyText.trim() : newComment.trim())}
        >
          ↑
        </button>
        {replyingTo && (
          <button 
            type="button" 
            onClick={() => { setReplyingTo(null); setReplyText(''); }}
            className="cancel-reply-btn"
          >
            Скасувати
          </button>
        )}
      </form>
    </div>
  );
};

export default Comments;