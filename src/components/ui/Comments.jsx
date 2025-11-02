import React, { useState, useEffect } from 'react';
import './Comments.css';

const Comments = ({ postId, initialCount = 0 }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showComments, setShowComments] = useState(false);

  const fetchComments = async (offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:3001/api/posts/${postId}/comments?offset=${offset}&limit=5`);
      const data = await response.json();
      
      if (data.success) {
        if (offset === 0) {
          setComments(data.comments);
        } else {
          setComments(prev => [...prev, ...data.comments]);
        }
        setHasMore(data.hasMore);
      } else {
        setError(data.error || 'Помилка завантаження коментарів');
      }
    } catch (err) {
      setError('Помилка мережі');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      // Оптимістичне оновлення
      const tempComment = {
        _id: `temp-${Date.now()}`,
        content: newComment.trim(),
        author: {
          name: 'Ви',
          avatar: null
        },
        createdAt: new Date().toISOString(),
        isTemp: true
      };

      setComments(prev => [tempComment, ...prev]);
      setNewComment('');

      const response = await fetch(`http://localhost:3001/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
          authorId: 'temp-user-id' // TODO: замінити на реальний ID користувача
        })
      });

      const data = await response.json();

      if (data.success) {
        // Замінюємо тимчасовий коментар на реальний
        setComments(prev => prev.map(comment => 
          comment.isTemp ? data.comment : comment
        ));
      } else {
        // Видаляємо тимчасовий коментар при помилці
        setComments(prev => prev.filter(comment => !comment.isTemp));
        setError(data.error || 'Помилка додавання коментаря');
      }
    } catch (err) {
      // Видаляємо тимчасовий коментар при помилці
      setComments(prev => prev.filter(comment => !comment.isTemp));
      setError('Помилка мережі');
      console.error('Error submitting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'щойно';
    if (diffInMinutes < 60) return `${diffInMinutes} хв тому`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} год тому`;
    return `${Math.floor(diffInMinutes / 1440)} дн тому`;
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      fetchComments(0);
    }
  };

  return (
    <div className="comments-section">
      <button 
        className="comments-toggle"
        onClick={toggleComments}
      >
        💬 {initialCount} коментарів
      </button>

      {showComments && (
        <div className="comments-container">
          {/* Форма додавання коментаря */}
          <form onSubmit={handleSubmitComment} className="comment-form">
            <div className="comment-input-container">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Напишіть коментар..."
                className="comment-input"
                maxLength={500}
                rows={2}
              />
              <div className="comment-form-actions">
                <span className="char-count">{newComment.length}/500</span>
                <button 
                  type="submit" 
                  className="comment-submit-btn"
                  disabled={!newComment.trim() || submitting}
                >
                  {submitting ? 'Відправка...' : 'Відправити'}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="comments-error">
              {error}
            </div>
          )}

          {/* Список коментарів */}
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment._id} className={`comment-item ${comment.isTemp ? 'temp' : ''}`}>
                <div className="comment-avatar">
                  {comment.author.avatar ? (
                    <img src={comment.author.avatar} alt={comment.author.name} />
                  ) : (
                    <div className="comment-avatar-placeholder">
                      {comment.author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">{comment.author.name}</span>
                    <span className="comment-time">{getTimeAgo(comment.createdAt)}</span>
                  </div>
                  <div className="comment-text">{comment.content}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="comments-loading">
                <div className="spinner"></div>
                <span>Завантаження коментарів...</span>
              </div>
            )}

            {hasMore && !loading && (
              <button 
                className="load-more-comments"
                onClick={() => fetchComments(comments.length)}
              >
                Завантажити ще
              </button>
            )}

            {comments.length === 0 && !loading && (
              <div className="no-comments">
                Поки що немає коментарів. Будьте першим!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Comments;