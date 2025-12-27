import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PhotoUpload from '../components/PhotoUpload/PhotoUpload';
import { photosService } from '../features/profile/services/photosService';
import './PhotosPage.css';

const Photos = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const photoUploadRef = useRef(null);
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    const initializePhotos = async () => {
      try {
        setLoading(true);
        
        const authToken = localStorage.getItem('accessToken');
        if (!authToken) {
          navigate('/login');
          return;
        }

        // Отримуємо userId з токена якщо не передано в URL
        let targetUserId = userId;
        const token = localStorage.getItem('accessToken');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const tokenUserId = payload.id;
          setCurrentUserId(tokenUserId);
          
          if (!targetUserId) {
            targetUserId = tokenUserId;
            navigate(`/photos/${targetUserId}`, { replace: true });
            return;
          }
        }

        await loadPhotos(targetUserId);
      } catch (error) {
        console.error('Error initializing photos:', error);
      } finally {
        setLoading(false);
      }
    };

    initializePhotos();
  }, [userId, navigate]);

  const loadPhotos = async (targetUserId) => {
    try {
      const userPhotos = await photosService.getUserPhotos(targetUserId);
      setPhotos(userPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
      setPhotos([]);
    }
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleCloseModal = () => {
    setSelectedPhoto(null);
  };

  const handleOpenUpload = () => {
    setShowUploadModal(true);
  };

  const handleCloseUpload = () => {
    setShowUploadModal(false);
    setSelectedFiles([]);
  };

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  const handleUploadSubmit = async () => {
    try {
      const filesToUpload = photoUploadRef.current?.getFilesForUpload() || []
      
      if (filesToUpload.length === 0) {
        console.error('No files to upload')
        return
      }
      
      await photosService.uploadPhotos(filesToUpload)
      await loadPhotos(userId)
      handleCloseUpload()
    } catch (error) {
      console.error('Upload error:', error)
    }
  };

  const handleDeletePhoto = async (photoId, e) => {
    e.stopPropagation();
    try {
      await photosService.deletePhoto(photoId);
      await loadPhotos(userId);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleToggleLike = async (photoId, type, e) => {
    e.stopPropagation();
    try {
      await photosService.togglePhotoLike(photoId, type);
      await loadPhotos(userId);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  if (loading) {
    return (
      <div className="photos-page">
        <div className="loading">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="photos-page">
      <nav className="breadcrumbs">
        <span className="breadcrumb-item">
          <a className="breadcrumb-link" href={`/profile/${userId}`}>Профіль</a>
        </span>
        <span className="breadcrumb-item">
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Фото</span>
        </span>
      </nav>

      <div className="photos-header">
        <h1>Мої фото</h1>
      </div>

      <div className="photos-grid">
        {currentUserId === userId && (
          <div className="add-photo-card">
            <button className="add-photo-grid-btn" onClick={handleOpenUpload}>
              <span>+</span>
              <span>Додати фото</span>
            </button>
          </div>
        )}
        {photos.map((photo) => (
          <div 
            key={photo._id} 
            className="photo-card"
            onClick={() => handlePhotoClick(photo)}
          >
            <div className="photo-image">
              <img 
                src={`data:${photo.mimeType};base64,${photo.data}`} 
                alt={photo.description || 'Фото'}
                loading="lazy"
              />
              {currentUserId === userId && (
                <button 
                  className="photo-delete-btn"
                  onClick={(e) => handleDeletePhoto(photo._id, e)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              )}
              <div className="photo-actions">
                <button 
                  className={`photo-like-btn ${photo.userReaction === 'like' ? 'active' : ''}`}
                  onClick={(e) => handleToggleLike(photo._id, 'like', e)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                  </svg>
                  <span>{photo.likes || 0}</span>
                </button>
                <button 
                  className={`photo-dislike-btn ${photo.userReaction === 'dislike' ? 'active' : ''}`}
                  onClick={(e) => handleToggleLike(photo._id, 'dislike', e)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                  </svg>
                  <span>{photo.dislikes || 0}</span>
                </button>
                <button 
                  className="photo-comment-btn"
                  onClick={(e) => { e.stopPropagation(); /* TODO: відкрити коментарі */ }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && currentUserId !== userId && (
        <div className="empty-state">
          <p>У користувача поки немає фото</p>
        </div>
      )}

      {selectedPhoto && (
        <div className="photo-modal" onClick={handleCloseModal}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={handleCloseModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            
            <div className="photo-modal-image">
              <img 
                src={`data:${selectedPhoto.mimeType};base64,${selectedPhoto.data}`} 
                alt={selectedPhoto.description || 'Фото'} 
              />
            </div>
            
            <div className="photo-modal-sidebar">
              <div className="photo-modal-header">
                <h4>Фото</h4>
              </div>
              
              <div className="photo-modal-description">
                <p>{selectedPhoto.description || 'Опис не додано'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="photo-modal" onClick={handleCloseUpload}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={handleCloseUpload}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            
            <div className="upload-modal-content">
              <div className="upload-modal-header">
                <h4>Додати фото</h4>
              </div>
              
              <div className="upload-modal-body">
                <PhotoUpload 
                  ref={photoUploadRef}
                  photos={selectedFiles}
                  onPhotosChange={handleFilesChange}
                  maxPhotos={10}
                />
              </div>
              
              <div className="upload-modal-footer">
                <button 
                  className="upload-cancel-btn" 
                  onClick={handleCloseUpload}
                >
                  Скасувати
                </button>
                <button 
                  className="upload-submit-btn" 
                  onClick={handleUploadSubmit}
                  disabled={selectedFiles.length === 0}
                >
                  Завантажити ({selectedFiles.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;