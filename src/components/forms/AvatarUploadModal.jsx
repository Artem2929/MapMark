import React, { memo, useState, useRef, useCallback } from 'react'
import './AvatarUploadModal.css'

const AvatarUploadModal = memo(({ onClose, onUpload, currentAvatar }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0]
    if (!file || !file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedPhoto({
        file,
        preview: e.target.result
      })
    }
    reader.readAsDataURL(file)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!selectedPhoto) return

    try {
      setUploading(true)
      await onUpload(selectedPhoto.file)
      onClose()
    } catch (error) {
      console.error('Avatar upload error:', error)
    } finally {
      setUploading(false)
    }
  }, [selectedPhoto, onUpload, onClose])

  return (
    <div className="photo-upload-modal" onClick={onClose} role="dialog" aria-labelledby="modal-title" aria-modal="true">
      <div className="photo-upload-modal__content" onClick={(e) => e.stopPropagation()}>
        <header className="photo-upload-modal__header">
          <h2 id="modal-title">Змінити фото профілю</h2>
          <button className="photo-upload-modal__close" onClick={onClose} aria-label="Закрити">✕</button>
        </header>
        
        <div className="photo-upload-modal__body">
          <div className="photo-upload">
            {!selectedPhoto ? (
              <div className="photo-empty">
                <div className="photo-empty__icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    <circle cx="16.5" cy="8.5" r="1.5"/>
                  </svg>
                </div>
                <p>Перетягніть зображення або натисніть кнопку</p>
                <button className="photo-empty__btn" onClick={() => fileInputRef.current?.click()}>
                  <span>＋</span> Додати фото
                </button>
              </div>
            ) : (
              <div className="photo-preview photo-preview--full">
                <img 
                  src={selectedPhoto.preview} 
                  alt="Preview"
                  className="photo-preview__image"
                />
                <button 
                  className="photo-preview__remove"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            )}
            
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/jpeg,image/png,image/webp,image/gif" 
              hidden 
              onChange={handleFileSelect}
            />
          </div>
          
          <div className="photo-upload-modal__actions">
            <button className="btn secondary" onClick={onClose}>Скасувати</button>
            <button 
              className="btn primary" 
              disabled={!selectedPhoto || uploading}
              onClick={handleSubmit}
            >
              {uploading ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

AvatarUploadModal.displayName = 'AvatarUploadModal'

export default AvatarUploadModal