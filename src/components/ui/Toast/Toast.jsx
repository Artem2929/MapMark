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
          ×
        </button>
      )}
    </div>
  )
}

export { Toast }
export default Toast