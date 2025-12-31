import React from 'react'

const NewChatButton = ({ onClick, disabled = false }) => {
  return (
    <button 
      className="new-chat-button"
      onClick={onClick}
      disabled={disabled}
      title="Новий чат"
      aria-label="Створити новий чат"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
    </button>
  )
}

export default NewChatButton