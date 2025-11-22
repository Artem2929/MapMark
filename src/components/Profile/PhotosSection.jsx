import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../contexts/ProfileContext';
import { usePhotoUpload } from '../../hooks/usePhotoUpload';
import Toast from '../ui/Toast';
import EmptyState from '../ui/EmptyState';

const PhotosSection = () => {
  const navigate = useNavigate();
  const { photos, isOwnProfile, refreshPhotos, photosLoading, targetUserId, addPhoto } = useProfile();
  const { uploadPhoto, uploading } = usePhotoUpload();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  


  const handleDeletePhoto = (photoId) => {
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
        if (refreshPhotos) {
          refreshPhotos();
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

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const photoData = {
        description: '',
        tags: [],
        hashtags: '',
        location: null
      };
      const newPhoto = await uploadPhoto(file, photoData, targetUserId);
      if (addPhoto) {
        addPhoto(newPhoto);
      }
      if (refreshPhotos) {
        refreshPhotos();
      }
      setToast({ message: 'Фото успішно додано!', type: 'success' });
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    }
  };

  return (
    <div className="profile-photos-section">
      <div className="profile-photos-header">
        <h3>
          {isOwnProfile ? 'Мої фото' : 'Фото'} ({photos.length})
        </h3>
        {isOwnProfile && (
          <>
            <button 
              className="profile-basic-info__edit-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <span>+</span> {uploading ? 'Завантаження...' : 'Додати фото'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </>
        )}
      </div>
      
      <div className="profile-photos-grid">
        {photosLoading ? (
          // Skeleton loading
          Array.from({ length: 8 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="photo-skeleton"></div>
          ))
        ) : photos.length > 0 ? (
          photos
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3)
            .map((photo) => (
            <div 
              key={photo._id} 
              className="photo-gallery-item"
              onClick={() => navigate(`/photos/${targetUserId}`)}
            >
              <img src={photo.url} alt={photo.description || 'Фото'} />
              <div className="photo-overlay">
                <div className="photo-actions">
                  <button 
                    className="photo-action-btn view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/photos/${targetUserId}`);
                    }}
                    title="Переглянути"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  {isOwnProfile && (
                    <button 
                      className="photo-action-btn delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo._id);
                      }}
                      title="Видалити"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : null}
      </div>


      
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
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default PhotosSection;