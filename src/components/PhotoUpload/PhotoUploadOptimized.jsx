import React, { memo, useCallback, useRef } from 'react'
import './PhotoUpload.css'

const PhotoUpload = memo(({ photos = [], onPhotosChange, maxPhotos = 10 }) => {
  const fileInputRef = useRef(null)
  const fileObjectsRef = useRef(new Map()) // Зберігаємо оригінальні файли

  const handleFileSelect = useCallback((files) => {
    const newFiles = Array.from(files).slice(0, maxPhotos - photos.length)
    const newPhotos = [...photos]
    
    newFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const localUrl = URL.createObjectURL(file)
        newPhotos.push(localUrl)
        // Зберігаємо оригінальний файл для завантаження
        fileObjectsRef.current.set(localUrl, file)
      }
    })
    
    onPhotosChange(newPhotos)
  }, [photos, onPhotosChange, maxPhotos])

  const handleFileInput = useCallback((e) => {
    if (e.target.files?.length) {
      handleFileSelect(e.target.files)
      // Очищаємо input для можливості вибору тих самих файлів знову
      e.target.value = ''
    }
  }, [handleFileSelect])

  const removePhoto = useCallback((index) => {
    const photoToRemove = photos[index]
    const newPhotos = photos.filter((_, i) => i !== index)
    
    // Очищаємо blob URL та видаляємо з кешу
    if (photoToRemove?.startsWith('blob:')) {
      URL.revokeObjectURL(photoToRemove)
      fileObjectsRef.current.delete(photoToRemove)
    }
    
    onPhotosChange(newPhotos)
  }, [photos, onPhotosChange])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files?.length) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  // Функція для отримання оригінальних файлів для завантаження
  const getFilesForUpload = useCallback(() => {
    return photos.map(photoUrl => {
      if (photoUrl.startsWith('blob:')) {
        return fileObjectsRef.current.get(photoUrl)
      }
      return null
    }).filter(Boolean)
  }, [photos])

  // Експортуємо функцію через ref
  React.useImperativeHandle(fileInputRef, () => ({
    getFilesForUpload
  }), [getFilesForUpload])

  return (
    <div className="photo-upload">
      {photos.length === 0 && (
        <div 
          className="photos-section__empty"
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
          <p className="photos-section__empty-text">Додайте фото</p>
          <p className="photo-upload__hint">Перетягніть файли сюди або натисніть кнопку</p>
        </div>
      )}
      
      <div className="photo-upload-section">
        <input
          ref={fileInputRef}
          type="file"
          id="photo-upload-input"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          hidden
        />
        
        {photos.length > 0 && (
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
          {photos.map((photo, index) => (
            <div key={`${photo}-${index}`} className="photo-item">
              <div className="photo-preview">
                <img 
                  src={photo} 
                  alt={`Preview ${index + 1}`}
                  className="photo-preview-img"
                />
              </div>
              <button
                type="button"
                className="photo-remove-btn"
                onClick={() => removePhoto(index)}
                aria-label="Видалити фото"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

PhotoUpload.displayName = 'PhotoUpload'

export default PhotoUpload