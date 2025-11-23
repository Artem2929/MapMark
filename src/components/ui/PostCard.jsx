import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Comments from './Comments';
import './PostCard.css';

const PostCard = ({ post, onReaction, onComment, onShare, onSave, initialSaved = false }) => {
  const navigate = useNavigate();
  const [localStats, setLocalStats] = useState(post.stats);
  const [userReaction, setUserReaction] = useState(null); // 'like', 'dislike', або null
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);


  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'щойно';
    if (diffInMinutes < 60) return `${diffInMinutes} хв тому`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} год тому`;
    return `${Math.floor(diffInMinutes / 1440)} дн тому`;
  };

  const cleanDescription = (description) => {
    // Видаляємо рядки з локацією та все після них
    const lines = description.split('\n');
    const cleanLines = [];
    
    for (const line of lines) {
      if (line.includes('📍')) break;
      cleanLines.push(line);
    }
    
    return cleanLines.join('\n').trim();
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



  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: `${window.location.origin}/posts/${post.id}`
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
        alert('Посилання скопійовано в буфер обміну!');
      }
      onShare?.(post.id);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    const previousSaved = isSaved;
    
    // Оптимістичне оновлення
    setIsSaved(!isSaved);
    setIsSaving(true);
    
    try {
      const response = await onSave?.(post.id, !isSaved);
      if (response?.success) {
        setIsSaved(response.saved);
      }
    } catch (error) {
      // Відкат при помилці
      setIsSaved(previousSaved);
      console.error('Error saving post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="post-card">
      <div className="post-card__header">
        <Link to={`/profile/${post.author.id}`} className="post-card__author">
          <div className="post-card__avatar">
            {post.author.avatar ? (
              <img 
                src={`http://localhost:3001${post.author.avatar}`} 
                alt={post.author.name} 
                onError={(e) => {
                  console.log('Avatar failed to load:', post.author.avatar);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="post-card__avatar-placeholder"
              style={{ display: post.author.avatar ? 'none' : 'flex' }}
            >
              {post.author.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="post-card__author-info">
            <div className="post-meta">
              <div className="post-author">{post.author.name}</div>
              <div className="post-date">{getTimeAgo(post.createdAt)}</div>
            </div>
            {post.location && (
              <div className="post-location">📍 {post.location}</div>
            )}
          </div>
        </Link>
      </div>

      {post.image && (
        <div className="post-card__media" onClick={() => navigate(`/posts/${post.id}`)}>
          <img src={post.image} alt={post.title} className="post-card__image" />
        </div>
      )}

      <div className="post-card__content" onClick={() => navigate(`/posts/${post.id}`)}>
        <h3 className="post-card__title">{post.title}</h3>
        <p className="post-card__description">{cleanDescription(post.description)}</p>
      </div>

      <div className="post-card__actions">
        <div className="post-card__action-buttons">
          <button 
            className={`post-card__action-btn like-btn ${userReaction === 'like' ? 'active' : ''}`}
            onClick={() => handleReaction('like')}
            disabled={isUpdating}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            <span className="post-card__count">{localStats.likes}</span>
          </button>
          <button 
            className={`post-card__action-btn dislike-btn ${userReaction === 'dislike' ? 'active' : ''}`}
            onClick={() => handleReaction('dislike')}
            disabled={isUpdating}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
            </svg>
            <span className="post-card__count">{localStats.dislikes}</span>
          </button>
          <button 
            className="post-card__action-btn comment-btn"
            onClick={() => navigate(`/posts/${post.id}`)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="post-card__count">{localStats.comments}</span>
          </button>
          <button 
            className="post-card__action-btn share-btn"
            onClick={handleShare}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17l9.2-9.2M17 8v9h-9"></path>
            </svg>
          </button>
        </div>
        {/* TODO: Додати функціонал збереження постів
        <button 
          className={`post-card__save-btn ${isSaved ? 'saved' : ''}`}
          onClick={handleSave}
          disabled={isSaving}
          title={isSaved ? 'Видалити зі збережених' : 'Зберегти пост'}
        >
          <span className="post-card__save-icon">{isSaved ? '★' : '☆'}</span>
        </button>
        */}
      </div>


    </div>
  );
};

export default PostCard;