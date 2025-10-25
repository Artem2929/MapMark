import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import './Photos.css';

const Photos = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState({});
  const [commentLikes, setCommentLikes] = useState({});
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    loadPhotos();
  }, [currentUserId, navigate]);

  const loadPhotos = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/photos/user/${currentUserId}`);
      const result = await response.json();
      
      if (result.success) {
        setPhotos(result.data);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId, e) => {
    e.stopPropagation();
    if (!confirm('Видалити це фото?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/photos/${photoId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setPhotos(photos.filter(photo => photo._id !== photoId));
        if (selectedPhoto && selectedPhoto._id === photoId) {
          setSelectedPhoto(null);
        }
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleCloseModal = () => {
    setSelectedPhoto(null);
    setComment('');
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'щойно';
    if (diffInMinutes < 60) return `${diffInMinutes} хв тому`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} год тому`;
    return `${Math.floor(diffInMinutes / 1440)} дн тому`;
  };

  const handleCommentLike = (commentId, action) => {
    const currentState = commentLikes[commentId] || null;
    let newState = null;
    
    if (currentState === action) {
      newState = null; // Remove like/dislike if clicking same button
    } else {
      newState = action; // Set new like/dislike
    }
    
    setCommentLikes(prev => ({
      ...prev,
      [commentId]: newState
    }));
    
    // Update comment counts
    setComments(prev => {
      const photoComments = prev[selectedPhoto._id] || [];
      const updatedComments = photoComments.map(comment => {
        if (comment.id === commentId) {
          let likes = comment.likes;
          let dislikes = comment.dislikes;
          
          // Remove previous action
          if (currentState === 'like') likes--;
          if (currentState === 'dislike') dislikes--;
          
          // Add new action
          if (newState === 'like') likes++;
          if (newState === 'dislike') dislikes++;
          
          return { ...comment, likes, dislikes };
        }
        return comment;
      });
      
      return {
        ...prev,
        [selectedPhoto._id]: updatedComments
      };
    });
  };

  const handleCommentSubmit = () => {
    if (comment.trim() && selectedPhoto) {
      const newComment = {
        id: Date.now(),
        text: comment.trim(),
        author: 'Ви',
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0
      };
      
      setComments(prev => ({
        ...prev,
        [selectedPhoto._id]: [...(prev[selectedPhoto._id] || []), newComment]
      }));
      
      setComment('');
    }
  };

  if (loading) {
    return (
      <div className="photos-page">
        <div className="photos-loading">Завантаження...</div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Профіль', link: '/profile' },
    { label: 'Фото' }
  ];

  return (
    <div className="photos-page">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="photos-grid">
        {photos.length > 0 ? (
          photos.map((photo) => (
            <div key={photo._id} className="photo-card" onClick={() => handlePhotoClick(photo)}>
              <img 
                src={photo.url} 
                alt={photo.description || 'Фото'} 
              />
              {photo.description && (
                <div className="photo-description">{photo.description}</div>
              )}
              <div className="photo-actions">
                <button 
                  className="delete-btn"
                  onClick={(e) => handleDeletePhoto(photo._id, e)}
                >
                  Видалити
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-photos">
            <p>У вас поки немає фото</p>
            <button onClick={() => navigate('/profile')}>
              Додати фото
            </button>
          </div>
        )}
      </div>
      
      {selectedPhoto && (
        <div className="photo-modal" onClick={handleCloseModal}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={handleCloseModal}>
              ×
            </button>
            
            <div className="photo-modal-image">
              <img 
                src={selectedPhoto.url} 
                alt={selectedPhoto.description || 'Фото'} 
              />
            </div>
            
            <div className="photo-modal-sidebar">
              <div className="photo-modal-header">
                <h4>Фото</h4>
              </div>
              
              {selectedPhoto.description && (
                <div className="photo-modal-description">
                  <p>{selectedPhoto.description}</p>
                </div>
              )}
              
              <div className="photo-modal-comments">
                {comments[selectedPhoto._id] && comments[selectedPhoto._id].length > 0 ? (
                  comments[selectedPhoto._id].map((commentItem) => (
                    <div key={commentItem.id} className="comment-item">
                      <div className="comment-avatar">
                        {commentItem.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="comment-content">
                        <div className="comment-main">
                          <span className="comment-author">{commentItem.author}</span>
                          <span className="comment-text">{commentItem.text}</span>
                        </div>
                        <div className="comment-time">{formatTime(commentItem.timestamp)}</div>
                        <div className="comment-actions">
                          <button 
                            className={`comment-like-btn ${commentLikes[commentItem.id] === 'like' ? 'liked' : ''}`}
                            onClick={() => handleCommentLike(commentItem.id, 'like')}
                          >
                            <svg viewBox="0 0 24 24" fill={commentLikes[commentItem.id] === 'like' ? 'currentColor' : 'none'} stroke="currentColor">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            {commentItem.likes > 0 && commentItem.likes}
                          </button>
                          <button 
                            className={`comment-like-btn ${commentLikes[commentItem.id] === 'dislike' ? 'disliked' : ''}`}
                            onClick={() => handleCommentLike(commentItem.id, 'dislike')}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M7 13l3 3 7-7"/>
                              <path d="M7 13l-3-3M7 13l3-3"/>
                            </svg>
                            {commentItem.dislikes > 0 && commentItem.dislikes}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-comments">Коментарі ще не додані</div>
                )}
              </div>
              
              <div className="comment-input-section">
                <textarea
                  className="comment-input"
                  placeholder="Додати коментар..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={1}
                />
                {comment.trim() && (
                  <button 
                    className="comment-submit"
                    onClick={handleCommentSubmit}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;