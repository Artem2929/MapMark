import React, { memo } from 'react'

const ConversationItem = memo(({
  conversation,
  isActive,
  onSelect,
  onDelete
}) => {
  const participant = conversation.participant || {}
  
  const displayName = participant.name || 
    participant.username || 
    (participant.firstName && participant.lastName 
      ? `${participant.firstName} ${participant.lastName}` 
      : participant.firstName || participant.lastName || 
        (participant.email ? participant.email.split('@')[0] : 'Невідомий користувач'))

  const avatarSrc = participant.avatar?.startsWith('http') 
    ? participant.avatar 
    : `http://localhost:3001${participant.avatar}`

  const lastMessageText = conversation.lastMessage?.content || 'Немає повідомлень'
  
  const formattedTime = conversation.lastActivity 
    ? new Date(conversation.lastActivity).toLocaleTimeString('uk-UA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : ''

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    onDelete()
  }

  return (
    <div
      className={`conversation ${isActive ? 'active' : ''}`}
      onClick={onSelect}
    >
      <div className="conv-avatar">
        {participant.avatar ? (
          <img 
            src={avatarSrc} 
            alt={displayName}
            loading="lazy"
          />
        ) : (
          displayName.charAt(0).toUpperCase()
        )}
        {participant.isOnline && <div className="online-dot" />}
      </div>
      
      <div className="conv-info">
        <div className="conv-name">{displayName}</div>
        <div className="conv-last">{lastMessageText}</div>
      </div>
      
      <div className="conv-meta">
        <div className="conv-time">{formattedTime}</div>
        {conversation.unreadCount > 0 && (
          <div className="unread-count">{conversation.unreadCount}</div>
        )}
      </div>
      
      <button 
        className="chat-delete-btn"
        onClick={handleDeleteClick}
        title="Видалити чат"
      >
        ×
      </button>
    </div>
  )
})

ConversationItem.displayName = 'ConversationItem'

export default ConversationItem