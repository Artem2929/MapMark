import React, { memo, useState, useRef } from 'react'
import { createPortal } from 'react-dom'

const ChatHeaderMenu = ({ isOpen, onClose, onViewProfile, onClearChat, onBlock, anchorRef }) => {
  if (!isOpen) return null

  const rect = anchorRef.current?.getBoundingClientRect()
  if (!rect) return null

  const menuStyle = {
    position: 'fixed',
    top: rect.bottom + 8,
    right: window.innerWidth - rect.right,
    zIndex: 'var(--z-popover)'
  }

  const menuContent = (
    <>
      <div className="chat-header-menu__backdrop" onClick={onClose} />
      <div className="chat-header-menu" style={menuStyle}>
        <button className="chat-header-menu__item" onClick={onViewProfile}>
          <span className="chat-header-menu__icon">👤</span>
          <span>Переглянути профіль</span>
        </button>
        <button className="chat-header-menu__item" onClick={onClearChat}>
          <span className="chat-header-menu__icon">🗑️</span>
          <span>Очистити чат</span>
        </button>
        <button className="chat-header-menu__item chat-header-menu__item--danger" onClick={onBlock}>
          <span className="chat-header-menu__icon">🚫</span>
          <span>Заблокувати</span>
        </button>
      </div>
    </>
  )

  return createPortal(menuContent, document.body)
}

const ChatHeader = memo(({ conversation, isTyping }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef(null)

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

  const getStatusText = () => {
    if (isTyping) {
      return (
        <div className="typing-status">
          <div className="typing-dots">
            <span />
            <span />
            <span />
          </div>
          <span className="typing-text">друкує...</span>
        </div>
      )
    }
    
    if (participant.isOnline) {
      return 'В мережі'
    }
    
    return participant.lastSeen 
      ? `Був(ла) ${new Date(participant.lastSeen).toLocaleString('uk-UA')}`
      : 'Був(ла) нещодавно'
  }

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleViewProfile = () => {
    setIsMenuOpen(false)
    // TODO: Navigate to profile
  }

  const handleClearChat = () => {
    setIsMenuOpen(false)
    // TODO: Clear chat
  }

  const handleBlock = () => {
    setIsMenuOpen(false)
    // TODO: Block user
  }

  return (
    <div className="chat-header">
      <div className="chat-user">
        <div className="chat-avatar">
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
        
        <div className="chat-info">
          <div className="chat-name">{displayName}</div>
          <div className="chat-status">{getStatusText()}</div>
        </div>
      </div>

      <button 
        ref={menuButtonRef}
        className="chat-header__menu-button"
        onClick={handleMenuToggle}
        aria-label="Меню чату"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>

      <ChatHeaderMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onViewProfile={handleViewProfile}
        onClearChat={handleClearChat}
        onBlock={handleBlock}
        anchorRef={menuButtonRef}
      />
    </div>
  )
})

ChatHeader.displayName = 'ChatHeader'

export default ChatHeader