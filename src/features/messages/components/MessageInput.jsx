import React from 'react'
import { useMessageInput } from '../hooks/useMessageInput'

const MessageInput = ({ onSendMessage, onTyping }) => {
  const {
    message,
    isSending,
    attachedFile,
    canSend,
    textareaRef,
    handleChange,
    handleKeyDown,
    handleSend,
    handleFileAttach,
    removeFile
  } = useMessageInput(onSendMessage, onTyping)

  return (
    <div className="message-input">
      {attachedFile && (
        <div className="attached-file">
          <span className="attached-file__name">{attachedFile.name}</span>
          <button 
            className="attached-file__remove"
            onClick={removeFile}
            title="Видалити файл"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="message-input-wrapper">
        <button 
          className="attachment-btn"
          onClick={() => document.getElementById('file-input')?.click()}
          title="Прикріпити файл"
          disabled={isSending}
        >
          📎
        </button>
        
        <textarea
          ref={textareaRef}
          className="message-input__field"
          placeholder="Напишіть повідомлення... (Enter - відправити, Shift+Enter - новий рядок)"
          value={message}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          rows={1}
        />
      </div>
      
      <button 
        className={`send-btn ${canSend ? 'send-btn--active' : ''}`}
        onClick={handleSend}
        disabled={!canSend}
        title="Відправити"
      >
        {isSending ? (
          <div className="spinner" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        )}
      </button>
      
      <input
        id="file-input"
        type="file"
        className="file-input"
        onChange={(e) => handleFileAttach(e.target.files[0])}
        accept="*/*"
      />
    </div>
  )
}

export default MessageInput