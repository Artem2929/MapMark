import React, { memo, useState, useRef, useCallback } from 'react'
import './PhotoUploadModal.css'

const PhotoUploadModal = memo(({ onClose, onUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [hashtags, setHashtags] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = useCallback((event) => {
    const files = Array.from(event.target.files)
    if (!files.length) return

    const validFiles = files.filter(file => file.type.startsWith('image/'))
    const limitedFiles = validFiles.slice(0, 5 - selectedFiles.length)
    setSelectedFiles(prev => [...prev, ...limitedFiles].slice(0, 5))
  }, [selectedFiles.length])

  const handleSubmit = useCallback(async () => {
    if (!selectedFiles.length) return

    try {
      setUploading(true)
      await onUpload(selectedFiles)
      onClose()
    } catch (error) {
      console.error('Photo upload error:', error)
    } finally {
      setUploading(false)
    }
  }, [selectedFiles, onUpload, onClose])

  return (
    <div className="photo-upload-modal" onClick={onClose}>
      <div className="photo-upload-modal__content" onClick={(e) => e.stopPropagation()}>
        <header className="photo-upload-modal__header">
          <h2>Додати фото</h2>
          <button className="photo-upload-modal__close" onClick={onClose}>✕</button>
        </header>
        
        <div className="photo-upload-modal__body">
          <div className="photo-upload">
            {selectedFiles.length === 0 ? (
              <div className="photo-empty">
                <div className="photo-empty__icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h11c.55 0 1-.45 1-1z"/>
                  </svg>
                </div>
                <p>Перетягніть зображення або натисніть кнопку</p>
              <p className="photo-upload__limit">Максимум 5 фото</p>
                <button className="photo-empty__btn" onClick={() => fileInputRef.current?.click()}>
                  <span>＋</span> Додати фото
                </button>
              </div>
            ) : (
              <div className="photo-preview">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="photo-preview__item">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`Preview ${index + 1}`}
                      className="photo-preview__image"
                    />
                    <button 
                      className="photo-preview__remove"
                      onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button 
                  className="photo-preview__add"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedFiles.length >= 5}
                >
                  ＋
                </button>
              </div>
            )}
            
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/jpeg,image/png,image/webp,image/gif" 
              multiple 
              hidden 
              onChange={handleFileSelect}
            />
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="photo-upload-form">
              <div className="profile-edit-form__field">
                <label className="profile-edit-form__label">Опис</label>
                <textarea 
                  className="profile-edit-form__textarea" 
                  placeholder="Розкажіть про фото"
                  rows="1"
                  maxLength="500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ minHeight: '48px', resize: 'none', overflow: 'hidden', height: '48px' }}
                />
                <div className="profile-edit-form__char-count">{description.length}/500</div>
              </div>
              
              <div className="profile-edit-form__field">
                <label className="profile-edit-form__label">Місцезнаходження</label>
                <input 
                  type="text" 
                  className="profile-edit-form__input" 
                  placeholder="Місто, країна" 
                  maxLength="100"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <div className="profile-edit-form__char-count">{location.length}/100</div>
              </div>
              
              <div className="profile-edit-form__field">
                <label className="profile-edit-form__label">Хештеги</label>
                <input 
                  type="text" 
                  className="profile-edit-form__input" 
                  placeholder="#природа #подорож" 
                  maxLength="200"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                />
                <div className="profile-edit-form__char-count">{hashtags.length}/200</div>
              </div>
            </div>
          )}
          
          <div className="photo-upload-modal__actions">
            <button className="btn secondary" onClick={onClose}>Скасувати</button>
            <button 
              className="btn primary" 
              disabled={!selectedFiles.length || uploading}
              onClick={handleSubmit}
            >
              {uploading ? 'Завантаження...' : 'Завантажити'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

PhotoUploadModal.displayName = 'PhotoUploadModal'

export default PhotoUploadModal