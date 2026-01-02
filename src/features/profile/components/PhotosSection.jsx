import React, { memo, useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PhotoUploadModal from '../../../components/forms/PhotoUploadModal'
import { photosService } from '../services/photosService'
import { useAuth } from '../../../hooks/useAuth'
import './PhotosSection.css'

const PhotosSection = memo(({ userId, isOwnProfile }) => {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  // Завантаження фотографій
  const loadPhotos = useCallback(async () => {
    if (!userId) {
      console.warn('userId is undefined, skipping photo load')
      setLoading(false)
      return
    }

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
    if (userId) {
      loadPhotos()
    }
  }, [userId]) // Спрощені залежності

  const openPhotosPage = useCallback(() => {
    navigate(`/photos/${userId}`)
  }, [navigate, userId])

  const handleAddPhoto = useCallback(() => {
    setShowUploadModal(true)
  }, [])

  const handleCloseUpload = useCallback(() => {
    setShowUploadModal(false)
  }, [])

  // Мемоізовані URL для фото
  const photoUrls = useMemo(() => {
    return photos.reduce((acc, photo) => {
      acc[photo.id] = `data:${photo.mimeType};base64,${photo.data}`
      return acc
    }, {})
  }, [photos])

  const handlePhotoClick = useCallback((photo) => {
    navigate(`/photos/${userId}`)
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
          Показати всі фотографії {photos.length}
        </button>
      </div>

      <div className="photos-section__content">
        {photos.length === 0 ? (
          <div className="photo-empty">
            <div className="photo-empty__icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h11c.55 0 1-.45 1-1z"/>
              </svg>
            </div>

         
            <p>Перетягніть зображення або натисніть кнопку</p>

            {isOwnProfile && (
              <button className="photo-empty__btn" onClick={handleAddPhoto}>
                <span>＋</span> Додати фото
              </button>
            )}
          </div>
        ) : (
          <div className="photos-section__grid">
            {photos.slice(-3).map((photo) => (
              <div
                key={photo._id || photo.id}
                className="photos-section__item"
                onClick={() => handlePhotoClick(photo)}
              >
                <img
                  src={photoUrls[photo.id] || `data:${photo.mimeType};base64,${photo.data}`}
                  alt={photo.description || 'Фотографія'}
                  className="photos-section__image"
                  loading="lazy"
                />
                <div className="photos-section__overlay">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                </div>
              </div>
            ))}
            {isOwnProfile && photos.length === 0 && (
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
        <PhotoUploadModal
          onClose={handleCloseUpload}
          onUpload={async (files) => {
            await photosService.uploadPhotos(files)
            await loadPhotos()
          }}
        />
      )}
    </div>
  )
})

PhotosSection.displayName = 'PhotosSection'

export default PhotosSection
