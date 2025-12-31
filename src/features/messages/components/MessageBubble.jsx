import React, { memo } from 'react'

const MessageBubble = memo(({ message, isOwn, onDelete }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('uk-UA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
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
    if (!bytes) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderAttachment = () => {
    if (!message.fileUrl) return null

    const fileUrl = `http://localhost:3001${message.fileUrl}`

    if (message.fileType?.startsWith('image/')) {
      return (
        <div className="message-attachment">
          <img 
            src={fileUrl}
            alt={message.fileName}
            className="message-image"
            onClick={() => window.open(fileUrl, '_blank')}
            loading="lazy"
          />
        </div>
      )
    }

    return (
      <div className="message-attachment">
        <div 
          className="message-file"
          onClick={() => window.open(fileUrl, '_blank')}
        >
          <div className="message-file-icon">
            {getFileIcon(message.fileName)}
          </div>
          <div className="message-file-info">
            <div className="message-file-name">{message.fileName}</div>
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
            onClick={onDelete}
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