import React, { memo, useState, useRef, useCallback, useEffect } from 'react'
import './PhotoUploadModal.css'

const PhotoUploadModal = memo(({ onClose, onUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [errors, setErrors] = useState([])
  const fileInputRef = useRef(null)

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const POPULAR_HASHTAGS = ['#природа', '#подорож', '#фото', '#україна', '#життя', '#друзі', '#сім\'я', '#відпочинок']

  const validateFiles = useCallback((files) => {
    const newErrors = []
    const validFiles = []

    files.forEach((file, index) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        newErrors.push(`Файл ${file.name}: непідтримуваний формат`)
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        newErrors.push(`Файл ${file.name}: занадто великий (макс. 10MB)`)
        return
      }
      validFiles.push(file)
    })

    return { validFiles, errors: newErrors }
  }, [])

  const optimizeImage = useCallback((file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        const maxWidth = 1920
        const maxHeight = 1080
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(resolve, 'image/jpeg', 0.85)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }, [])

  const getLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=uk`
            )
            const data = await response.json()
            setLocation(`${data.city || data.locality || ''}, ${data.countryName || ''}`)
          } catch (error) {
            console.error('Geolocation error:', error)
          }
        },
        (error) => console.error('Geolocation error:', error)
      )
    }
  }, [])

  useEffect(() => {
    getLocation()
  }, [])
  const handleFileSelect = useCallback(async (event) => {
    const files = Array.from(event.target.files)
    if (!files.length) return

    const { validFiles, errors: validationErrors } = validateFiles(files)
    setErrors(validationErrors)

    if (validFiles.length > 0) {
      const optimizedFiles = await Promise.all(
        validFiles.map(async (file) => {
          const optimized = await optimizeImage(file)
          return new File([optimized], file.name, { type: 'image/jpeg' })
        })
      )
      
      const limitedFiles = optimizedFiles.slice(0, 5 - selectedFiles.length)
      setSelectedFiles(prev => [...prev, ...limitedFiles].slice(0, 5))
    }
  }, [selectedFiles.length, validateFiles, optimizeImage])

  const handleSubmit = useCallback(async (retryCount = 0) => {
    if (!selectedFiles.length) return

    try {
      setUploading(true)
      setErrors([])
      
      const formData = new FormData()
      
      selectedFiles.forEach((file, index) => {
        formData.append('photos', file)
        formData.append(`description_${index}`, description)
        formData.append(`location_${index}`, location)
        formData.append(`hashtags_${index}`, hashtags)
      })
      
      await onUpload(formData)
      onClose()
    } catch (error) {
      console.error('Photo upload error:', error)
      
      if (retryCount < 2) {
        setTimeout(() => handleSubmit(retryCount + 1), 1000)
      } else {
        setErrors(['Помилка завантаження. Спробуйте ще раз.'])
      }
    } finally {
      setUploading(false)
    }
  }, [selectedFiles, onUpload, onClose, description, location, hashtags])

  const handleTextareaChange = useCallback((e) => {
    const textarea = e.target
    const value = e.target.value
    setDescription(value)
    
    // Підрахунок рядків
    const lines = value.split('\n').length
    const wrappedLines = Math.ceil(value.length / 50) // приблизно 50 символів на рядок
    const totalLines = Math.max(lines, wrappedLines)
    
    if (totalLines > 1) {
      textarea.style.height = '80px' // зменшено з 96px
      textarea.style.overflowY = 'auto'
      textarea.style.paddingRight = '12px' // відступ для скролу
    } else {
      textarea.style.height = '48px'
      textarea.style.overflowY = 'hidden'
      textarea.style.paddingRight = '16px'
    }
  }, [])
  const handleHashtagChange = useCallback((e) => {
    const value = e.target.value
    const hashtags = value.split(' ').filter(tag => tag.trim())
    
    if (hashtags.length <= 10) {
      setHashtags(value)
      
      // Адаптація висоти
      const input = e.target
      const lines = Math.ceil(value.length / 50)
      
      if (lines > 1) {
        input.style.height = '80px'
        input.style.overflowY = 'auto'
        input.style.paddingRight = '12px'
      } else {
        input.style.height = '43px'
        input.style.overflowY = 'hidden'
        input.style.paddingRight = '16px'
      }
    }
  }, [])
  const handleHashtagSuggestion = useCallback((tag) => {
    const currentHashtags = hashtags.split(' ').filter(t => t.trim())
    if (currentHashtags.length < 10 && !hashtags.includes(tag)) {
      setHashtags(prev => prev ? `${prev} ${tag}` : tag)
    }
  }, [hashtags])

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose()
    } else if (event.key === 'Enter' && event.ctrlKey && selectedFiles.length > 0) {
      handleSubmit()
    }
  }, [onClose, handleSubmit, selectedFiles.length])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
  return (
    <div className="photo-upload-modal" onClick={onClose} role="dialog" aria-labelledby="modal-title" aria-modal="true">
      <div className="photo-upload-modal__content" onClick={(e) => e.stopPropagation()}>
        <header className="photo-upload-modal__header">
          <h2 id="modal-title">Додати фото</h2>
          <button className="photo-upload-modal__close" onClick={onClose} aria-label="Закрити">✕</button>
        </header>
        
        <div className="photo-upload-modal__body">
          {errors.length > 0 && (
            <div className="error-messages" role="alert">
              {errors.map((error, index) => (
                <div key={index} className="error-message">{error}</div>
              ))}
            </div>
          )}
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
                  onChange={handleTextareaChange}
                  style={{ minHeight: '48px', resize: 'none', overflow: 'hidden', height: '48px' }}
                  aria-describedby="desc-count"
                />
                <div id="desc-count" className="profile-edit-form__char-count">{description.length}/500</div>
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
                  aria-describedby="loc-count"
                />
                <div id="loc-count" className="profile-edit-form__char-count">{location.length}/100</div>
              </div>
              
              <div className="profile-edit-form__field">
                <label className="profile-edit-form__label">Хештеги</label>
                <input 
                  type="text" 
                  className="profile-edit-form__input" 
                  placeholder="#природа #подорож #фото" 
                  maxLength="200"
                  value={hashtags}
                  onChange={handleHashtagChange}
                  aria-describedby="hash-count"
                />
                <div id="hash-count" className="profile-edit-form__char-count">{hashtags.length}/200</div>
                <div className="hashtag-suggestions">
                  {POPULAR_HASHTAGS.map(tag => (
                    <button 
                      key={tag}
                      type="button"
                      className="hashtag-suggestion"
                      onClick={() => handleHashtagSuggestion(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="photo-upload-modal__actions">
            <button className="btn secondary" onClick={onClose}>Скасувати</button>
            <button 
              className="btn primary" 
              disabled={!selectedFiles.length || uploading}
              onClick={handleSubmit}
              title="Ctrl+Enter для швидкого завантаження"
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