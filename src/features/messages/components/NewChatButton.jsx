import React from 'react'

const NewChatButton = ({ onClick, disabled = false }) => {
  return (
    <button
      className="new-chat-button"
      onClick={onClick}
      disabled={disabled}
      title="Новий чат"
    >
      +
    </button>
  )
}

export default NewChatButton