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
  const [photoLikes, setPhotoLikes] = useState({});
  const [editingDescription, setEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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

  const handleDeletePhoto = (photoId, e) => {
    e.stopPropagation();
    setPhotoToDelete(photoId);
    setShowDeleteModal(true);
  };

  const confirmDeletePhoto = async () => {
    if (!photoToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/photos/${photoToDelete}`, {
        method: 'DELETE'
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
    // Load comments for selected photo
    try {
      const response = await fetch(`http://localhost:3000/api/photos/${photo._id}/comments`);
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
    let newState = currentState === action ? null : action;
    
    try {
      const response = await fetch(`http://localhost:3000/api/photos/${photoId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, type: newState })
      });
      
      const result = await response.json();
      if (result.success) {
        setPhotoLikes(prev => ({ ...prev, [photoId]: newState }));
        // Update photo stats in photos array
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
    setNewDescription(selectedPhoto.description || '');
  };

  const handleSaveDescription = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/photos/${selectedPhoto._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newDescription })
      });
      
      const result = await response.json();
      if (result.success) {
        setSelectedPhoto(prev => ({ ...prev, description: newDescription }));
        setPhotos(prev => prev.map(photo => 
          photo._id === selectedPhoto._id 
            ? { ...photo, description: newDescription }
            : photo
        ));
        setEditingDescription(false);
      }
    } catch (error) {
      console.error('Error updating description:', error);
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

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', selectedFile.file);
      formData.append('description', uploadDescription);
      formData.append('userId', currentUserId);
      
      const response = await fetch('http://localhost:3000/api/photos/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        await loadPhotos();
        handleCloseUploadModal();
        setShowSuccessModal(true);
      } else {
        alert(result.message || 'Помилка при додаванні фото');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      alert(`Помилка при додаванні фото: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setUploadDescription('');
  };

  const handleTextareaChange = (e) => {
    setUploadDescription(e.target.value);
    // Auto-resize textarea
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
    let newState = currentState === action ? null : action;
    
    try {
      const response = await fetch(`http://localhost:3000/api/photos/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, type: newState })
      });
      
      const result = await response.json();
      if (result.success) {
        setCommentLikes(prev => ({ ...prev, [commentId]: newState }));
        // Update comment in state
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
    if (comment.trim() && selectedPhoto) {
      try {
        const response = await fetch(`http://localhost:3000/api/photos/${selectedPhoto._id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId, text: comment.trim() })
        });
        
        const result = await response.json();
        if (result.success) {
          setComments(prev => ({
            ...prev,
            [selectedPhoto._id]: [result.data, ...(prev[selectedPhoto._id] || [])]
          }));
          setComment('');
          // Update comment count in photos
          setPhotos(prev => prev.map(photo => 
            photo._id === selectedPhoto._id 
              ? { ...photo, stats: { ...photo.stats, comments: photo.stats.comments + 1 } }
              : photo
          ));
        }
      } catch (error) {
        console.error('Error adding comment:', error);
      }
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
          <>
            {photos.map((photo) => {
              const stats = photo.stats || { likes: 0, dislikes: 0, comments: 0 };
              return (
                <div key={photo._id} className="photo-card">
                  <div className="photo-image" onClick={() => handlePhotoClick(photo)}>
                    <img 
                      src={photo.url} 
                      alt={photo.description || 'Фото'} 
                    />
                    <div className="photo-actions">
                      <button 
                        className="delete-btn"
                        onClick={(e) => handleDeletePhoto(photo._id, e)}
                      >
                        Видалити
                      </button>
                    </div>
                  </div>
                  <div className="photo-stats">
                    <div style={{display: 'flex', gap: '8px'}}>
                      <div 
                        className={`photo-stat-item ${photoLikes[photo._id] === 'like' ? 'liked' : ''}`}
                        onClick={(e) => handlePhotoLike(photo._id, 'like', e)}
                      >
                        👍 {stats.likes}
                      </div>
                      <div 
                        className={`photo-stat-item ${photoLikes[photo._id] === 'dislike' ? 'disliked' : ''}`}
                        onClick={(e) => handlePhotoLike(photo._id, 'dislike', e)}
                      >
                        👎 {stats.dislikes}
                      </div>
                      <div 
                        className="photo-stat-item"
                        onClick={() => handlePhotoClick(photo)}
                      >
                        💬 {stats.comments}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="add-photo-card">
              <button className="add-photo-grid-btn" onClick={() => setShowUploadModal(true)}>
                <span>+</span>
                <span>Додати фото</span>
              </button>
            </div>
          </>
        ) : (
          <div className="no-photos">
            <p>У вас поки немає фото</p>
            <button className="add-photo-btn" onClick={() => setShowUploadModal(true)}>
              <span>+</span> Додати фото
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
                <button 
                  className="edit-description-btn"
                  onClick={handleEditDescription}
                >
                  Редагувати
                </button>
              </div>
              
              <div className="photo-modal-description">
                {editingDescription ? (
                  <div>
                    <textarea
                      className="description-textarea"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Додати опис..."
                    />
                    <div className="delete-confirmation-actions">
                      <button 
                        className="delete-confirmation-btn cancel"
                        onClick={handleCancelEdit}
                      >
                        Скасувати
                      </button>
                      <button 
                        className="delete-confirmation-btn delete"
                        onClick={handleSaveDescription}
                      >
                        Зберегти
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>{selectedPhoto.description || 'Опис не додано'}</p>
                )}
              </div>
              
              <div className="photo-modal-comments">
                {comments[selectedPhoto._id] && comments[selectedPhoto._id].length > 0 ? (
                  comments[selectedPhoto._id].map((commentItem) => (
                    <div key={commentItem._id} className="comment-item">
                      <div className="comment-avatar">
                        {commentItem.userId?.avatar ? (
                          <img src={commentItem.userId.avatar} alt={commentItem.userId.name} />
                        ) : (
                          commentItem.userId?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="comment-content">
                        <div className="comment-main">
                          <span className="comment-author">{commentItem.userId?.name || 'Користувач'}</span>
                          <span className="comment-text">{commentItem.text}</span>
                        </div>
                        <div className="comment-time">{formatTime(commentItem.createdAt)}</div>
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
              
              <div className="photo-modal-description">
                <textarea
                  className="upload-textarea"
                  value={uploadDescription}
                  onChange={handleTextareaChange}
                  placeholder="Напишіть опис..."
                  rows={1}
                />
              </div>
              
              <div className="photo-modal-comments">
                <div className="upload-modal-actions">
                  <button 
                    className="upload-modal-btn cancel"
                    onClick={handleCloseUploadModal}
                  >
                    Скасувати
                  </button>
                  <button 
                    className={`upload-modal-btn submit ${(!selectedFile || uploading) ? 'disabled' : ''}`}
                    onClick={handleUploadSubmit}
                    disabled={!selectedFile || uploading}
                  >
                    {uploading ? 'Завантаження...' : 'Опублікувати'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showSuccessModal && (
        <div className="delete-confirmation-modal" onClick={() => setShowSuccessModal(false)}>
          <div className="delete-confirmation-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-confirmation-title">Успіх!</h3>
            <p className="delete-confirmation-message">
              Фото успішно додано до вашої галереї.
            </p>
            <div className="delete-confirmation-actions">
              <button 
                className="delete-confirmation-btn delete single"
                onClick={() => setShowSuccessModal(false)}
              >
                Ок
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;