import React, { memo, useState, useCallback } from 'react'

const PhotosSection = memo(({ photos = [] }) => {
  const [failedImages, setFailedImages] = useState(new Set())

  const handleImageError = useCallback((photoId) => {
    setFailedImages(prev => {
      const newSet = new Set(prev)
      newSet.add(photoId)
      return newSet
    })
  }, [])

  return (
    <div className="photos-section">
      <div className="photos-section__header">
        <h3 className="photos-section__title">Фотографії</h3>
      </div>
      <div className="photos-section__content">
        {photos.length === 0 ? (
          <p className="photos-section__empty">Фотографії відсутні</p>
        ) : (
          <div className="photos-section__grid">
            {photos.map((photo, index) => {
              const photoKey = photo.id || `photo-${photo.url}-${index}`
              const isHidden = failedImages.has(photoKey)
              
              return (
                <div key={photoKey} className="photos-section__item" style={{ display: isHidden ? 'none' : 'block' }}>
                  <img 
                    src={photo.url} 
                    alt={photo.title || 'Фотографія'} 
                    onError={() => handleImageError(photoKey)}
                  />
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