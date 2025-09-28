import React, { useState } from 'react';
import Comment from './Comment';

const Post = ({ post, onReaction, onShare, onComment, onReply, canComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showReactions, setShowReactions] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'щойно';
    if (diffInMinutes < 60) return `${diffInMinutes} хв тому`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} год тому`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} дн тому`;
    
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleReaction = (reactionType) => {
    onReaction(post.id, reactionType);
    setShowReactions(false);
  };

  const handleShare = () => {
    onShare(post.id);
  };

  const reactions = [
    { type: 'like', emoji: '👍', label: 'Подобається' },
    { type: 'love', emoji: '❤️', label: 'Любов' },
    { type: 'laugh', emoji: '😂', label: 'Сміх' },
    { type: 'wow', emoji: '😮', label: 'Вау' },
    { type: 'sad', emoji: '😢', label: 'Сумно' },
    { type: 'angry', emoji: '😠', label: 'Злість' }
  ];

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onComment(post.id, { content: commentText.trim() });
    setCommentText('');
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="post">
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">
            {post.author?.avatar ? (
              <img src={post.author.avatar} alt={post.author.name} />
            ) : (
              post.author?.name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
          <div className="author-info">
            <div className="author-name">{post.author?.name || 'Невідомий користувач'}</div>
            <div className="post-date">{formatDate(post.date)}</div>
          </div>
        </div>
        <button className="post-menu">⋯</button>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        
        {post.images && post.images.length > 0 && (
          <div className={`post-images ${post.images.length > 1 ? 'multiple' : ''}`}>
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image.url || image}
                alt={`Post image ${index + 1}`}
                className="post-image"
              />
            ))}
          </div>
        )}
      </div>

      <div className="post-actions">
        <div className="post-action-buttons">
          <div className="reaction-container">
            <button
              onClick={() => handleReaction('like')}
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
              className={`action-btn like-btn ${post.likedByUser ? 'liked' : ''}`}
            >
              <span className="action-icon">
                {post.userReaction ? reactions.find(r => r.type === post.userReaction)?.emoji : '👍'}
              </span>
              <span className="action-text">
                {post.likes > 0 && post.likes}
              </span>
            </button>
            
            {showReactions && (
              <div 
                className="reactions-popup"
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
              >
                {reactions.map(reaction => (
                  <button
                    key={reaction.type}
                    onClick={() => handleReaction(reaction.type)}
                    className={`reaction-btn ${post.userReaction === reaction.type ? 'active' : ''}`}
                    title={reaction.label}
                  >
                    {reaction.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleComments}
            className="action-btn comment-btn"
          >
            <span className="action-icon">💬</span>
            <span className="action-text">
              {post.comments.length > 0 && post.comments.length}
            </span>
          </button>

          <button onClick={handleShare} className="action-btn share-btn">
            <span className="action-icon">📤</span>
            <span className="action-text">
              {post.shares > 0 && post.shares}
            </span>
          </button>
        </div>
      </div>

      {(showComments || post.comments.length > 0) && (
        <div className="comments-section">
          {post.comments.map(comment => (
            <Comment
              key={comment.id || comment._id || Math.random()}
              comment={comment}
              postId={post.id}
              onReply={onReply}
              canReply={canComment}
            />
          ))}

          {canComment && (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <div className="comment-input-container">
                <div className="commenter-avatar">В</div>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Написати коментар..."
                  className="comment-input"
                />
                {commentText.trim() && (
                  <button type="submit" className="comment-submit">
                    ➤
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Post;