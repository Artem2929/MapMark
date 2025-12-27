import React from 'react'
import './Toast.css'

const Toast = ({ message, type = 'info', onClose, className = '' }) => {
  const classes = ['toast', `toast--${type}`, className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <span className="toast__message">{message}</span>
      {onClose && (
        <button 
          className="toast__close" 
          onClick={onClose}
          aria-label="Закрити повідомлення"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      )}
    </div>
  )
}

export { Toast }
export default Toast