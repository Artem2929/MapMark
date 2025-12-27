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
            key={photo.id} 
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
                  onClick={(e) => handleDeletePhoto(photo.id, e)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              )}
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