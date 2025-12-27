import React, { memo, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PhotoUpload from '../../../components/PhotoUpload/PhotoUpload'
import { photosService } from '../services/photosService'
import { useAuth } from '../../../hooks/useAuth'
import './PhotosSection.css'

const PhotosSection = memo(({ userId, isOwnProfile }) => {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  // Завантаження фотографій
  const loadPhotos = useCallback(async () => {
    try {
      setLoading(true)
      const userPhotos = await photosService.getUserPhotos(userId)
      setPhotos(userPhotos)
    } catch (error) {
      console.error('Error loading photos:', error)
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadPhotos()
  }, [loadPhotos])

  const openPhotosPage = useCallback(() => {
    navigate(`/photos/${userId}`)
  }, [navigate, userId])

  const handleAddPhoto = useCallback(() => {
    setShowUploadModal(true)
  }, [])

  const handleCloseUpload = useCallback(() => {
    setShowUploadModal(false)
    setSelectedFiles([])
  }, [])

  const handleFilesChange = useCallback((files) => {
    setSelectedFiles(files)
  }, [])

  const handleUploadSubmit = useCallback(async () => {
    if (selectedFiles.length === 0 || uploading) return
    
    try {
      setUploading(true)
      await photosService.uploadPhotos(selectedFiles)
      await loadPhotos() // Перезавантажуємо фото після успішного завантаження
      handleCloseUpload()
    } catch (error) {
      console.error('Upload error:', error)
      // TODO: Показати повідомлення про помилку
    } finally {
      setUploading(false)
    }
  }, [selectedFiles, uploading, loadPhotos, handleCloseUpload])

  const handlePhotoClick = useCallback((photo) => {
    navigate(`/photos/${userId}?selected=${photo.id}`)
  }, [navigate, userId])

  if (loading) {
    return (
      <div className="photos-section">
        <div className="photos-section__header">
          <h3 className="photos-section__title">Фотографії</h3>
        </div>
        <div className="photos-section__loading">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="photos-section">
      <div className="photos-section__header">
        <h3 className="photos-section__title">Фотографії</h3>
        <button 
          className="photos-section__show-all" 
          onClick={openPhotosPage}
          disabled={photos.length === 0}
        >
          Показати всі фотографії ({photos.length})
        </button>
      </div>
      
      <div className="photos-section__content">
        {photos.length === 0 ? (
          <div className="photos-section__empty">
            <div className="photos-section__empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
              {isOwnProfile && (
                <button className="photos-section__add-icon-btn" onClick={handleAddPhoto}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </button>
              )}
            </div>
            <p className="photos-section__empty-text">
              {isOwnProfile ? 'Додайте фото' : 'Фотографій немає'}
            </p>
          </div>
        ) : (
          <div className="photos-section__grid">
            {photos.slice(0, 6).map((photo) => (
              <div 
                key={photo.id} 
                className="photos-section__item"
                onClick={() => handlePhotoClick(photo)}
              >
                <img 
                  src={photo.thumbnailUrl || photo.url} 
                  alt={photo.description || 'Фотографія'}
                  className="photos-section__image"
                  loading="lazy"
                />
                <div className="photos-section__overlay">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                </div>
              </div>
            ))}
            {isOwnProfile && photos.length < 6 && (
              <div className="photos-section__add-item">
                <button className="photos-section__add-btn--grid" onClick={handleAddPhoto}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
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
                  photos={selectedFiles}
                  onPhotosChange={handleFilesChange}
                  maxPhotos={10}
                />
              </div>
              
              <div className="upload-modal-footer">
                <button 
                  className="upload-cancel-btn" 
                  onClick={handleCloseUpload}
                  disabled={uploading}
                >
                  Скасувати
                </button>
                <button 
                  className="upload-submit-btn" 
                  onClick={handleUploadSubmit}
                  disabled={selectedFiles.length === 0 || uploading}
                >
                  {uploading ? 'Завантаження...' : `Завантажити (${selectedFiles.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

PhotosSection.displayName = 'PhotosSection'

export default PhotosSection