import React, { useState, useEffect, useCallback, useRef } from 'react';
import { classNames } from '../utils/classNames';
import { useOptimizedState } from '../hooks/useOptimizedState';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import HashtagInput from '../components/ui/HashtagInput';
import './Photos.css';
import './PhotosModalStyles.css';

const Photos = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState({});
  const [commentLikes, setCommentLikes] = useState({});
  const [photoLikes, setPhotoLikes] = useState({});
  const [editingDescription, setEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [category, setCategory] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [uploading, setUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [heartAnimations, setHeartAnimations] = useState({});
  const [bookmarkedPhotos, setBookmarkedPhotos] = useState(new Set());
  const [imageLoadStates, setImageLoadStates] = useState({});
  const [hashtags, setHashtags] = useState([]);
  
  const navigate = useNavigate();
  const { userId } = useParams();
  const currentUserId = localStorage.getItem('userId');
  const targetUserId = userId || currentUserId;

  useEffect(() => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    loadPhotos();
  }, [currentUserId, targetUserId, navigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedPhoto) {
        if (e.key === 'Escape') {
          handleCloseModal();
        } else if (e.key === 'ArrowLeft') {
          navigatePhoto(-1);
        } else if (e.key === 'ArrowRight') {
          navigatePhoto(1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, photos]);

  const navigatePhoto = (direction) => {
    if (!selectedPhoto || photos.length === 0) return;
    
    const currentIndex = photos.findIndex(p => p._id === selectedPhoto._id);
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < photos.length) {
      handlePhotoClick(photos[newIndex]);
    }
  };

  const handleDoubleClick = useCallback((photoId, e) => {
    e.preventDefault();
    
    // Show heart animation
    setHeartAnimations(prev => ({ ...prev, [photoId]: true }));
    setTimeout(() => {
      setHeartAnimations(prev => ({ ...prev, [photoId]: false }));
    }, 800);
    
    // Like the photo
    handlePhotoLike(photoId, 'like', e);
  }, []);

  const handleBookmark = useCallback((photoId, e) => {
    e.stopPropagation();
    setBookmarkedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  }, []);

  const handleShare = useCallback((photo, e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: 'Подивіться на це фото',
        text: photo.description || 'Фото',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Посилання скопійовано!');
    }
  }, []);

  const handleImageLoad = useCallback((photoId) => {
    setImageLoadStates(prev => ({ ...prev, [photoId]: true }));
  }, []);

  const handleImageError = useCallback((photoId) => {
    setImageLoadStates(prev => ({ ...prev, [photoId]: 'error' }));
  }, []);

  const loadPhotos = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/photos/user/${targetUserId}`);
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

  const handleDeletePhoto = (photoId, e) => {
    e.stopPropagation();
    setPhotoToDelete(photoId);
    setShowDeleteModal(true);
  };

  const confirmDeletePhoto = async () => {
    if (!photoToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/photos/${photoToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        setPhotos(photos.filter(photo => photo._id !== photoToDelete));
        if (selectedPhoto && selectedPhoto._id === photoToDelete) {
          setSelectedPhoto(null);
        }
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    } finally {
      setShowDeleteModal(false);
      setPhotoToDelete(null);
    }
  };

  const cancelDeletePhoto = () => {
    setShowDeleteModal(false);
    setPhotoToDelete(null);
  };

  const handlePhotoClick = async (photo) => {
    setSelectedPhoto(photo);
    try {
      const response = await fetch(`http://localhost:3001/api/photos/${photo._id}/comments`);
      const result = await response.json();
      if (result.success) {
        setComments(prev => ({
          ...prev,
          [photo._id]: result.data
        }));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handlePhotoLike = async (photoId, action, e) => {
    e.stopPropagation();
    const currentState = photoLikes[photoId] || null;
    const newState = currentState === action ? null : action;
    
    try {
      const response = await fetch(`http://localhost:3001/api/photos/${photoId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, type: newState })
      });
      
      const result = await response.json();
      if (result.success) {
        setPhotoLikes(prev => ({ ...prev, [photoId]: newState }));
        setPhotos(prev => prev.map(photo => 
          photo._id === photoId 
            ? { ...photo, stats: { ...photo.stats, ...result.data } }
            : photo
        ));
      }
    } catch (error) {
      console.error('Error updating photo like:', error);
    }
  };

  const handleCloseModal = () => {
    setSelectedPhoto(null);
    setComment('');
    setEditingDescription(false);
    setNewDescription('');
  };

  const handleEditDescription = () => {
    setEditingDescription(true);
    const desc = typeof selectedPhoto.description === 'string' ? selectedPhoto.description : '';
    setNewDescription(desc);
  };

  const handleSaveDescription = async () => {
    if (newDescription.length > 1000) {
      alert('Опис занадто довгий (максимум 1000 символів)');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/photos/${selectedPhoto._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newDescription.trim() })
      });
      
      const result = await response.json();
      if (result.success) {
        setSelectedPhoto(prev => ({ ...prev, description: newDescription.trim() }));
        setPhotos(prev => prev.map(photo => 
          photo._id === selectedPhoto._id 
            ? { ...photo, description: newDescription.trim() }
            : photo
        ));
        setEditingDescription(false);
      } else {
        alert(result.message || 'Помилка при оновленні опису');
      }
    } catch (error) {
      console.error('Error updating description:', error);
      alert('Помилка при оновленні опису');
    }
  };

  const handleCancelEdit = () => {
    setEditingDescription(false);
    setNewDescription('');
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Розмір файлу не повинен перевищувати 5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert('Можна завантажувати тільки зображення');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedFile({
        file,
        preview: e.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.file.type)) {
      alert('Дозволені тільки файли JPEG, PNG та WebP');
      return;
    }

    if (selectedFile.file.size > 5 * 1024 * 1024) {
      alert('Розмір файлу не повинен перевищувати 5MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(selectedFile.file);
      });

      setUploadProgress(30);

      const response = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          content: uploadDescription || 'Нове фото',
          images: [{ url: base64Data }],
          type: 'image',
          visibility: visibility,
          category: category
        })
      });
      
      setUploadProgress(70);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        const photoFormData = new FormData();
        photoFormData.append('photo', selectedFile.file);
        photoFormData.append('description', uploadDescription);
        photoFormData.append('hashtags', JSON.stringify(hashtags));
        photoFormData.append('userId', currentUserId);
        
        await fetch('http://localhost:3001/api/photos/upload', {
          method: 'POST',
          body: photoFormData
        });
        
        setUploadProgress(100);
        await loadPhotos();
        handleCloseUploadModal();
        setShowSuccessModal(true);
      } else {
        throw new Error(result.message || 'Помилка при додаванні фото');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      alert(`Помилка при додаванні фото: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setUploadDescription('');
    setCategory('');
    setVisibility('public');
    setUploadProgress(0);
    setHashtags([]);
  };

  const handleTextareaChange = (e) => {
    setUploadDescription(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
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

  const handleCommentLike = async (commentId, action) => {
    const currentState = commentLikes[commentId] || null;
    const newState = currentState === action ? null : action;
    
    try {
      const response = await fetch(`http://localhost:3001/api/photos/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, type: newState })
      });
      
      const result = await response.json();
      if (result.success) {
        setCommentLikes(prev => ({ ...prev, [commentId]: newState }));
        setComments(prev => {
          const photoComments = prev[selectedPhoto._id] || [];
          const updatedComments = photoComments.map(comment => 
            comment._id === commentId 
              ? { ...comment, ...result.data }
              : comment
          );
          return { ...prev, [selectedPhoto._id]: updatedComments };
        });
      }
    } catch (error) {
      console.error('Error updating comment like:', error);
    }
  };

  const handleCommentSubmit = async () => {
    const trimmedComment = comment.trim();
    if (trimmedComment && selectedPhoto && trimmedComment.length <= 500) {
      try {
        const response = await fetch(`http://localhost:3001/api/photos/${selectedPhoto._id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId, text: trimmedComment })
        });
        
        const result = await response.json();
        if (result.success) {
          setComments(prev => ({
            ...prev,
            [selectedPhoto._id]: [result.data, ...(prev[selectedPhoto._id] || [])]
          }));
          setComment('');
          setPhotos(prev => prev.map(photo => 
            photo._id === selectedPhoto._id 
              ? { ...photo, stats: { ...photo.stats, comments: photo.stats.comments + 1 } }
              : photo
          ));
        } else {
          alert(result.message || 'Помилка при додаванні коментаря');
        }
      } catch (error) {
        console.error('Error adding comment:', error);
        alert('Помилка при додаванні коментаря');
      }
    } else if (trimmedComment.length > 500) {
      alert('Коментар занадто довгий (максимум 500 символів)');
    }
  };

  const handleAvatarClick = (userId) => {
    navigate(`/profile/${userId}`);
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
        {targetUserId === currentUserId && (
          <div className="add-photo-card">
            <button className="add-photo-grid-btn" onClick={() => setShowUploadModal(true)}>
              <span>+</span>
              <span>Додати фото</span>
            </button>
          </div>
        )}
        {photos.length > 0 ? (
          photos.map((photo) => {
            const stats = photo.stats || { likes: 0, dislikes: 0, comments: 0 };
            const isLoaded = imageLoadStates[photo._id];
            const isError = imageLoadStates[photo._id] === 'error';
            
            return (
              <div 
                key={photo._id} 
                className={`photo-card ${!isLoaded && !isError ? 'loading' : ''}`}
                onDoubleClick={(e) => handleDoubleClick(photo._id, e)}
                tabIndex={0}
                role="button"
                aria-label={`Фото: ${photo.description || 'Без опису'}`}
              >
                <div className="photo-image" onClick={() => handlePhotoClick(photo)}>
                  {!isError ? (
                    <img 
                      src={photo.url} 
                      alt={photo.description || 'Фото'}
                      loading="lazy"
                      onLoad={() => handleImageLoad(photo._id)}
                      onError={() => handleImageError(photo._id)}
                      data-loaded={isLoaded ? 'true' : 'false'}
                    />
                  ) : (
                    <div className="photo-error">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                      </svg>
                      <span>Помилка завантаження</span>
                    </div>
                  )}
                  
                  {heartAnimations[photo._id] && (
                    <div className="heart-animation">❤️</div>
                  )}
                  
                  {(photo.userId === currentUserId || targetUserId === currentUserId) && (
                    <div className="photo-actions">
                      <button 
                        className="delete-btn"
                        onClick={(e) => {
                          console.log('Delete clicked:', { photoUserId: photo.userId, currentUserId, targetUserId });
                          handleDeletePhoto(photo._id, e);
                        }}
                        title="Видалити"
                      >
                        Видалити
                      </button>
                    </div>
                  )}
                </div>
                <div className="photo-stats">
                  <button 
                    className={`photo-stat-item ${photoLikes[photo._id] === 'like' ? 'liked' : ''}`}
                    onClick={(e) => handlePhotoLike(photo._id, 'like', e)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={photoLikes[photo._id] === 'like' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                    <span>{stats.likes}</span>
                  </button>
                  <button 
                    className={`photo-stat-item ${photoLikes[photo._id] === 'dislike' ? 'disliked' : ''}`}
                    onClick={(e) => handlePhotoLike(photo._id, 'dislike', e)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={photoLikes[photo._id] === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                    </svg>
                    <span>{stats.dislikes}</span>
                  </button>
                  <button 
                    className="photo-stat-item"
                    onClick={() => handlePhotoClick(photo)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>{stats.comments}</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-photos">
            <p>{targetUserId === currentUserId ? 'У вас поки немає фото' : 'У користувача поки немає фото'}</p>
          </div>
        )}
      </div>
      
      {/* Rest of the modals remain the same */}
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
                {targetUserId === currentUserId && (
                  <button 
                    className="edit-description-btn"
                    onClick={handleEditDescription}
                  >
                    Редагувати
                  </button>
                )}
              </div>
              
              <div className="photo-modal-description">
                {editingDescription ? (
                  <div className="message-input">
                    <div className="message-input-wrapper">
                      <textarea 
                        placeholder="Напишіть повідомлення..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        maxLength={500}
                        rows={1}
                      />
                    </div>
                    <button 
                      className="send-btn"
                      onClick={handleSaveDescription}
                      disabled={!newDescription.trim()}
                    >
                      ↑
                    </button>
                  </div>
                ) : (
                  <>
                    <p>{typeof selectedPhoto.description === 'string' ? selectedPhoto.description : (selectedPhoto.description ? JSON.stringify(selectedPhoto.description) : 'Опис не додано')}</p>
                    {selectedPhoto.hashtags && selectedPhoto.hashtags.length > 0 && (
                      <div className="photo-hashtags">
                        {selectedPhoto.hashtags.map((hashtag, index) => (
                          <span key={index} className="photo-hashtag">
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="photo-modal-comments">
                {comments[selectedPhoto._id] && comments[selectedPhoto._id].length > 0 ? (
                  comments[selectedPhoto._id].map((commentItem) => (
                    <div key={commentItem._id} className="comment-item">
                      <div className="comment-content">
                        <div className="comment-main">
                          <div className="comment-author">
                            <div 
                              className="comment-avatar"
                              onClick={() => handleAvatarClick(commentItem.userId?._id)}
                              style={{ cursor: 'pointer' }}
                            >
                              {commentItem.userId?.avatar ? (
                                <img src={`http://localhost:3001${commentItem.userId.avatar}`} alt={commentItem.userId.name} />
                              ) : (
                                commentItem.userId?.name?.charAt(0).toUpperCase() || 'U'
                              )}
                            </div>
                            <span>{commentItem.userId?.name || 'Користувач'}</span>
                          </div>
                          <span className="comment-time">{formatTime(commentItem.createdAt)}</span>
                        </div>
                        <div className="comment-text">{commentItem.text}</div>
                        <div className="comment-actions">
                          <button 
                            className={`comment-like-btn ${commentLikes[commentItem._id] === 'like' ? 'liked' : ''}`}
                            onClick={() => handleCommentLike(commentItem._id, 'like')}
                          >
                            <svg viewBox="0 0 24 24" fill={commentLikes[commentItem._id] === 'like' ? 'currentColor' : 'none'} stroke="currentColor">
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                            </svg>
                            {commentItem.likes > 0 && commentItem.likes}
                          </button>
                          <button 
                            className={`comment-like-btn ${commentLikes[commentItem._id] === 'dislike' ? 'disliked' : ''}`}
                            onClick={() => handleCommentLike(commentItem._id, 'dislike')}
                          >
                            <svg viewBox="0 0 24 24" fill={commentLikes[commentItem._id] === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor">
                              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
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
              
              <div className="message-input">
                <div className="message-input-wrapper">
                  <textarea 
                    placeholder="Напишіть повідомлення..."
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    maxLength={500}
                    rows={1}
                  />
                </div>
                <button 
                  className="send-btn"
                  onClick={handleCommentSubmit}
                  disabled={!comment.trim() || comment.length > 500}
                >
                  ↑
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showDeleteModal && (
        <div className="delete-confirmation-modal" onClick={cancelDeletePhoto}>
          <div className="delete-confirmation-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-confirmation-title">Видалити фото?</h3>
            <p className="delete-confirmation-message">
              Цю дію неможливо буде скасувати. Фото буде назавжди видалено.
            </p>
            <div className="delete-confirmation-actions">
              <button 
                className="delete-confirmation-btn cancel"
                onClick={cancelDeletePhoto}
              >
                Скасувати
              </button>
              <button 
                className="delete-confirmation-btn delete"
                onClick={confirmDeletePhoto}
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showUploadModal && (
        <div className="photo-modal" onClick={handleCloseUploadModal}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={handleCloseUploadModal}>
              ×
            </button>
            
            <div className="photo-modal-image">
              {!selectedFile ? (
                <div 
                  className="simple-drop-zone"
                  onClick={() => document.getElementById('photo-input').click()}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px', color: '#3b82f6' }}>+</div>
                  <p>Перетягніть фото сюди або натисніть для вибору</p>
                  <input
                    id="photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>
              ) : (
                <img src={selectedFile.preview} alt="Попередній перегляд" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              )}
            </div>
            
            <div className="photo-modal-sidebar">
              <div className="photo-modal-header">
                <h4>Додати нове фото</h4>
              </div>
              
              <div className="message-input">
                <div className="message-input-wrapper">
                  <textarea 
                    placeholder="Напишіть опис..."
                    value={uploadDescription}
                    onChange={(e) => {
                      setUploadDescription(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    maxLength={500}
                    rows={1}
                  />
                </div>
                <button 
                  className="send-btn"
                  onClick={handleUploadSubmit}
                  disabled={!selectedFile || uploading || !uploadDescription.trim()}
                >
                  ↑
                </button>
              </div>
              
              <HashtagInput
                value={hashtags}
                onChange={setHashtags}
                placeholder="Додати хештеги... #travel #ukraine"
                maxTags={10}
                className="photo-modal-hashtag-input"
              />
                
              {uploading && uploadProgress > 0 && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{uploadProgress}%</span>
                </div>
              )}
              

            </div>
          </div>
        </div>
      )}
      
      {showSuccessModal && (
        <div className="delete-confirmation-modal" onClick={() => setShowSuccessModal(false)}>
          <div className="delete-confirmation-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-confirmation-title">Успіх!</h3>
            <p className="delete-confirmation-message">
              Фото успішно опубліковано! Воно тепер відображається у вашому профілі та стрічці огляду місць.
            </p>
            <div className="delete-confirmation-actions">
              <button 
                className="delete-confirmation-btn cancel"
                onClick={() => setShowSuccessModal(false)}
              >
                Залишитися
              </button>
              <button 
                className="delete-confirmation-btn delete"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate(`/profile/${currentUserId}`);
                }}
              >
                Перейти до профілю
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;