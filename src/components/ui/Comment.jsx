import React, { useState, memo } from 'react';
import { classNames } from '../../utils/classNames';

const Comment = memo(({  comment, postId, onReply, canReply  }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'щойно';
    if (diffInMinutes < 60) return `${diffInMinutes} хв`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} год`;
    return `${Math.floor(diffInMinutes / 1440)} дн`;
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    onReply(postId, comment.id, { content: replyText.trim() });
    setReplyText('');
    setShowReplyForm(false);
    setShowReplies(true);
  };

  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  return (
    <div className="comment">
      <div className="comment-main">
        <div className="comment-avatar">
          {comment.author?.avatar ? (
            <img src={comment.author.avatar} alt={comment.author.name} />
          ) : (
            comment.author?.name?.charAt(0)?.toUpperCase() || 'U'
          )}
        </div>
        
        <div className="comment-content">
          <div className="comment-header">
            <div className="comment-bubble">
              <div className="comment-author">{comment.author?.name || 'Невідомий користувач'}</div>
              <div className="comment-text">{comment.content}</div>
            </div>
            <span className="comment-time">{formatDate(comment.date)}</span>
          </div>
          
          <div className="comment-actions">
            {canReply && (
              <button
                onClick={toggleReplyForm}
                className="comment-reply-btn"
              >
                Відповісти
              </button>
            )}
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies-section">
          {!showReplies ? (
            <button
              onClick={toggleReplies}
              className="show-replies-btn"
            >
              ↳ Показати відповіді ({comment.replies.length})
            </button>
          ) : (
            <>
              <button
                onClick={toggleReplies}
                className="hide-replies-btn"
              >
                ↳ Приховати відповіді
              </button>
              <div className="replies-list">
                {comment.replies.map(reply => (
                  <div key={reply.id} className="reply">
                    <div className="reply-avatar">
                      {reply.author.avatar ? (
                        <img src={reply.author.avatar} alt={reply.author.name} />
                      ) : (
                        reply.author.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="reply-content">
                      <div className="reply-bubble">
                        <div className="reply-author">{reply.author.name}</div>
                        <div className="reply-text">{reply.content}</div>
                      </div>
                      <div className="reply-date">{formatDate(reply.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="reply-form">
          <div className="reply-input-container">
            <div className="replier-avatar">В</div>
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Відповісти ${comment.author?.name || 'користувачу'}...`}
              className="reply-input"
              autoFocus
            />
            {replyText.trim() && (
              <button type="submit" className="reply-submit">
                ➤
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
});

Comment.displayName = 'Comment';

export default Comment;