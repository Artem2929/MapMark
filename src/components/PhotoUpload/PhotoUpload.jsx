import React, { memo, useCallback, useRef, useMemo, forwardRef, useImperativeHandle } from 'react'
import './PhotoUpload.css'

const PhotoUpload = memo(forwardRef(({ photos = [], onPhotosChange, maxPhotos = 10 }, ref) => {
  const fileInputRef = useRef(null)
  const fileObjectsRef = useRef(new Map())
  const dragCounterRef = useRef(0)
  const [isDragging, setIsDragging] = React.useState(false)

  // Мемоізовані обчислення
  const remainingSlots = useMemo(() => maxPhotos - photos.length, [maxPhotos, photos.length])
  const isMaxReached = useMemo(() => photos.length >= maxPhotos, [photos.length, maxPhotos])

  const handleFileSelect = useCallback((files) => {
    if (isMaxReached) return
    
    const newFiles = Array.from(files).slice(0, remainingSlots)
    const newPhotos = [...photos]
    
    newFiles.forEach(file => {
      if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
        const localUrl = URL.createObjectURL(file)
        newPhotos.push(localUrl)
        fileObjectsRef.current.set(localUrl, file)
      }
    })
    
    onPhotosChange(newPhotos)
  }, [photos, onPhotosChange, remainingSlots, isMaxReached])

  const handleFileInput = useCallback((e) => {
    if (e.target.files?.length) {
      handleFileSelect(e.target.files)
      e.target.value = ''
    }
  }, [handleFileSelect])

  const removePhoto = useCallback((index) => {
    const photoToRemove = photos[index]
    const newPhotos = photos.filter((_, i) => i !== index)
    
    if (photoToRemove?.startsWith('blob:')) {
      URL.revokeObjectURL(photoToRemove)
      fileObjectsRef.current.delete(photoToRemove)
    }
    
    onPhotosChange(newPhotos)
  }, [photos, onPhotosChange])

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (!isDragging) {
      setIsDragging(true)
    }
  }, [isDragging])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    
    dragCounterRef.current = 0
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files?.length && !isMaxReached) {
      handleFileSelect(files)
    }
  }, [handleFileSelect, isMaxReached])

  const getFilesForUpload = useCallback(() => {
    return photos.map(photoUrl => {
      if (photoUrl.startsWith('blob:')) {
        return fileObjectsRef.current.get(photoUrl)
      }
      return null
    }).filter(Boolean)
  }, [photos])

  useImperativeHandle(ref, () => ({
    getFilesForUpload
  }), [getFilesForUpload])

  // Очищення при розмонтуванні
  React.useEffect(() => {
    return () => {
      photos.forEach(photo => {
        if (photo.startsWith('blob:')) {
          URL.revokeObjectURL(photo)
        }
      })
    }
  }, [])

  return (
    <div className="photo-upload">
      {photos.length === 0 && (
        <div 
          className={`photos-section__empty ${isDragging ? 'photos-section__empty--dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="photos-section__empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
            <label htmlFor="photo-upload-input" className="photos-section__add-icon-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </label>
          </div>
          <p className="photos-section__empty-text">
            {isDragging ? 'Відпустіть для завантаження' : 'Додайте фото'}
          </p>
          <p className="photo-upload__hint">
            Перетягніть файли сюди або натисніть кнопку
          </p>
        </div>
      )}
      
      <div className="photo-upload-section">
        <input
          ref={fileInputRef}
          type="file"
          id="photo-upload-input"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileInput}
          hidden
          disabled={isMaxReached}
        />
        
        {photos.length > 0 && !isMaxReached && (
          <label htmlFor="photo-upload-input" className="photo-upload-add-more">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Додати ще ({photos.length}/{maxPhotos})
          </label>
        )}
      </div>
      
      {photos.length > 0 && (
        <div className="photo-preview-container">
          <div className="photo-carousel">
            <div className="photo-carousel-track">
              {photos.map((photo, index) => (
                <div key={`${photo}-${index}`} className="photo-carousel-item">
                  <img 
                    src={photo} 
                    alt={`Preview ${index + 1}`}
                    className="photo-carousel-img"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    className="photo-remove-btn"
                    onClick={() => removePhoto(index)}
                    aria-label="Видалити фото"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}))

PhotoUpload.displayName = 'PhotoUpload'

export default PhotoUpload