import React, { memo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './PhotosSection.css'

const PhotosSection = memo(({ photos = [], isOwnProfile }) => {
  const [failedImages, setFailedImages] = useState(new Set())
  const navigate = useNavigate()

  const handleImageError = useCallback((photoId) => {
    setFailedImages(prev => {
      const newSet = new Set(prev)
      newSet.add(photoId)
      return newSet
    })
  }, [])

  const openPhotosPage = useCallback(() => {
    navigate('/photos')
  }, [navigate])

  const handleAddPhoto = useCallback(() => {
    // TODO: Implement photo upload functionality
  }, [])

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
            </div>
            <p className="photos-section__empty-text">
              {isOwnProfile ? 'Додайте перше фото' : 'Фотографій немає'}
            </p>
            {isOwnProfile && (
              <button className="photos-section__add-btn" onClick={handleAddPhoto}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/>
                </svg>
                Додати фото
              </button>
            )}
          </div>
        ) : (
          <div className="photos-section__grid">
            {photos.slice(0, 3).map((photo, index) => {
              const photoKey = photo.id || `photo-${photo.url || 'unknown'}-${index}`
              const isHidden = failedImages.has(photoKey)
              
              return (
                <div 
                  key={photoKey} 
                  className="photos-section__item" 
                  style={{ display: isHidden ? 'none' : 'block' }}
                  onClick={openPhotosPage}
                >
                  <img 
                    src={photo.url} 
                    alt={photo.title || 'Фотографія'}
                    className="photos-section__image"
                    onError={() => handleImageError(photoKey)}
                  />
                  <div className="photos-section__overlay">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
})

PhotosSection.displayName = 'PhotosSection'

export default PhotosSection