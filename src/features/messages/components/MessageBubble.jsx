import React, { memo } from 'react'

const MessageBubble = memo(({ message, isOwn, onDelete }) => {
  const formatTime = (timestamp) => {
    try {
      if (!timestamp) return '--:--'
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) return '--:--'
      
      return date.toLocaleTimeString('uk-UA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch (error) {
      console.error('Помилка форматування часу:', error)
      return '--:--'
    }
  }

  const getFileIcon = (fileName) => {
    if (!fileName) return '📎'
    
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return '🖼️'
    if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) return '🎥'
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) return '🎵'
    if (['pdf'].includes(extension)) return '📄'
    if (['doc', 'docx'].includes(extension)) return '📝'
    if (['zip', 'rar', '7z'].includes(extension)) return '📦'
    return '📎'
  }

  const formatFileSize = (bytes) => {
    try {
      if (!bytes || bytes === 0) return '0 Bytes'
      if (typeof bytes !== 'number' || bytes < 0) return '0 Bytes'
      
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      if (i >= sizes.length) return '0 Bytes'
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    } catch (error) {
      console.error('Помилка форматування розміру файла:', error)
      return '0 Bytes'
    }
  }

  const handleImageClick = (url) => {
    try {
      const newWindow = window.open(url, '_blank')
      if (!newWindow) {
        console.error('Не вдалося відкрити зображення')
      }
    } catch (error) {
      console.error('Помилка відкриття зображення:', error)
    }
  }

  const handleFileClick = (url) => {
    try {
      const newWindow = window.open(url, '_blank')
      if (!newWindow) {
        console.error('Не вдалося відкрити файл')
      }
    } catch (error) {
      console.error('Помилка відкриття файла:', error)
    }
  }

  const renderAttachment = () => {
    if (!message.fileUrl) return null

    const fileUrl = `http://localhost:3001${message.fileUrl}`

    if (message.fileType?.startsWith('image/')) {
      return (
        <div className="message-attachment">
          <img 
            src={fileUrl}
            alt={message.fileName || 'Зображення'}
            className="message-image"
            onClick={() => handleImageClick(fileUrl)}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none'
              console.error('Помилка завантаження зображення:', fileUrl)
            }}
          />
        </div>
      )
    }

    return (
      <div className="message-attachment">
        <div 
          className="message-file"
          onClick={() => handleFileClick(fileUrl)}
        >
          <div className="message-file-icon">
            {getFileIcon(message.fileName)}
          </div>
          <div className="message-file-info">
            <div className="message-file-name">{message.fileName || 'Невідомий файл'}</div>
            <div className="message-file-size">{formatFileSize(message.fileSize)}</div>
          </div>
        </div>
      </div>
    )
  }

  const renderVoiceMessage = () => {
    if (!message.voiceUrl) return null

    return (
      <div className="message-voice">
        <button className="voice-play-btn">▶️</button>
        <div className="voice-waveform">
          <div className="voice-progress" />
        </div>
        <div className="voice-duration">{message.duration || '0:00'}</div>
      </div>
    )
  }

  const getStatusIcon = () => {
    if (!isOwn) return null
    
    switch (message.status) {
      case 'sent': return '✓'
      case 'delivered': return '✓✓'
      case 'read': return '✓✓'
      default: return null
    }
  }

  return (
    <div className={`message ${isOwn ? 'me' : 'other'}`}>
      <div className="message-bubble">
        {message.content && (
          <div className="message-text">{message.content}</div>
        )}
        
        {renderAttachment()}
        {renderVoiceMessage()}
        
        <div className="message-time">
          {formatTime(message.createdAt)}
          {isOwn && (
            <span className={`message-status ${message.status}`}>
              {getStatusIcon()}
            </span>
          )}
        </div>
        
        {isOwn && (
          <button 
            className="message-delete-btn"
            onClick={() => {
              try {
                if (onDelete && typeof onDelete === 'function') {
                  onDelete()
                }
              } catch (error) {
                console.error('Помилка видалення повідомлення:', error)
              }
            }}
            title="Видалити повідомлення"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
})

MessageBubble.displayName = 'MessageBubble'

export default MessageBubble