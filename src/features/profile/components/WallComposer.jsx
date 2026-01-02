import { memo, useState, useCallback, useRef } from 'react'
import EmojiPicker from './EmojiPicker'
import './WallComposer.css'

const MAX_CHARS = 2000
const MAX_IMAGES = 2

const WallComposer = memo(({ user, onPostCreated }) => {
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const handleContentChange = useCallback((e) => {
    const value = e.target.value
    if (value.length <= MAX_CHARS) {
      setContent(value)
      setError(null)
      
      // Auto-resize textarea
      const textarea = textareaRef.current
      textarea.style.height = '80px'
      const newHeight = Math.min(textarea.scrollHeight, 400)
      textarea.style.height = `${newHeight}px`
    }
  }, [])

  const handleImageSelect = useCallback((e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  }, [images])

  const handleFiles = useCallback((files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (images.length + imageFiles.length > MAX_IMAGES) {
      setError(`Максимум ${MAX_IMAGES} фото`)
      return
    }

    const newImages = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36)
    }))

    setImages(prev => [...prev, ...newImages])
    setError(null)
  }, [images])

  const handleRemoveImage = useCallback((imageId) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== imageId)
      const removed = prev.find(img => img.id === imageId)
      if (removed) {
        URL.revokeObjectURL(removed.preview)
      }
      return updated
    })
  }, [])

  const handleEmojiSelect = useCallback((emoji) => {
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.slice(0, start) + emoji + content.slice(end)
    
    if (newContent.length <= MAX_CHARS) {
      setContent(newContent)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 0)
    }
  }, [content])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [handleFiles])

  const handleSubmit = useCallback(async () => {
    if ((!content.trim() && images.length === 0) || isSubmitting) return
    
    const trimmedContent = content.trim()
    
    // Validate content
    if (trimmedContent.length > MAX_CHARS) {
      setError(`Максимум ${MAX_CHARS} символів`)
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const formData = new FormData()
      if (trimmedContent) {
        formData.append('content', trimmedContent)
      }
      
      images.forEach((img) => {
        formData.append('images', img.file)
      })

      await onPostCreated(formData)
      
      setContent('')
      setImages([])
      images.forEach(img => URL.revokeObjectURL(img.preview))
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = '80px'
      }
    } catch (err) {
      setError(err.message || 'Помилка створення посту')
    } finally {
      setIsSubmitting(false)
    }
  }, [content, images, isSubmitting, onPostCreated])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }, [handleSubmit])

  const charsLeft = MAX_CHARS - content.length
  const canSubmit = (content.trim() || images.length > 0) && !isSubmitting

  return (
    <div 
      className={`wall-composer ${isDragging ? 'wall-composer--dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="wall-composer__avatar">
        <img 
          src={user?.avatar || '/default-avatar.svg'} 
          alt={user?.name || 'Аватар'}
          className="wall-composer__avatar-img"
        />
      </div>
      
      <div className="wall-composer__content">
        <textarea 
          ref={textareaRef}
          placeholder="Що у вас нового?"
          className="wall-composer__textarea"
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          rows={3}
        />
        
        {images.length > 0 && (
          <div className={`wall-composer__preview wall-composer__preview--${images.length}`}>
            {images.map(img => (
              <div key={img.id} className="wall-composer__preview-item">
                <img src={img.preview} alt="Preview" />
                <button
                  type="button"
                  className="wall-composer__preview-remove"
                  onClick={() => handleRemoveImage(img.id)}
                  disabled={isSubmitting}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        
        {error && (
          <div className="wall-composer__error">
            {error}
          </div>
        )}
        
        <div className="wall-composer__actions">
          <div className="wall-composer__tools">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="wall-composer__file-input"
              disabled={isSubmitting || images.length >= MAX_IMAGES}
            />
            
            <button 
              type="button"
              className="wall-composer__tool" 
              title="Додати фото"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || images.length >= MAX_IMAGES}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </button>
            
            <button 
              type="button"
              className={`wall-composer__tool ${showEmojiPicker ? 'wall-composer__tool--active' : ''}`}
              title="Додати емодзі"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={isSubmitting}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </button>
            
            {showEmojiPicker && (
              <EmojiPicker 
                onSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}
          </div>
          
          <div className="wall-composer__submit-group">
            {content.length > 0 && (
              <span className={`wall-composer__counter ${charsLeft < 100 ? 'wall-composer__counter--warning' : ''}`}>
                {charsLeft}
              </span>
            )}
            
            <button 
              type="button"
              className="wall-composer__submit"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L3 12h6v10h6V12h6z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {isDragging && (
        <div className="wall-composer__drop-overlay">
          <div className="wall-composer__drop-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
            <p>Перетягніть фото сюди</p>
          </div>
        </div>
      )}
    </div>
  )
})

WallComposer.displayName = 'WallComposer'

export default WallComposer
