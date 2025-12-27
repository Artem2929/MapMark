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
      onClose() // Закриваємо модальне вікно після успішного завантаження
    } catch (error) {
      console.error('Avatar upload error:', error)
    } finally {
      setUploading(false)
    }
  }, [selectedPhoto, onUpload, onClose])

  const handleRemovePhoto = useCallback(() => {
    setSelectedPhoto(null)
  }, [])

  return (
    <div className="avatar-modal-overlay" onClick={onClose}>
      <div className="avatar-modal" onClick={(e) => e.stopPropagation()}>
        <div className="avatar-modal__header">
          <h2>Змінити фото профілю</h2>
          <button className="avatar-modal__close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="avatar-modal__content">
          <div className="avatar-preview-section">
            <div className="avatar-current">
              <img 
                src={selectedPhoto?.preview || currentAvatar || '/default-avatar-modal.svg'} 
                alt="Аватар"
                onError={(e) => {
                  e.target.src = '/default-avatar-modal.svg'
                }}
              />
            </div>
          </div>

          <div className="avatar-actions">
            <button 
              className="avatar-action avatar-action--primary"
              onClick={() => fileInputRef.current?.click()}
            >
              Завантажити фото
            </button>
          </div>

          {selectedPhoto && (
            <div className="avatar-save-section">
              <button 
                className="avatar-save-btn"
                onClick={handleSubmit}
                disabled={uploading}
              >
                {uploading ? 'Збереження...' : 'Зберегти'}
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
})

AvatarUploadModal.displayName = 'AvatarUploadModal'

export default AvatarUploadModal