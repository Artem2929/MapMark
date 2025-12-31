import React, { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

const ContextMenu = ({ 
  x, 
  y, 
  items = [], 
  onClose,
  className = 'context-menu'
}) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  const handleClickOutside = useCallback((e) => {
    if (!e.target.closest(`.${className}`)) {
      onClose()
    }
  }, [onClose, className])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('click', handleClickOutside)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [handleKeyDown, handleClickOutside])

  const menuContent = (
    <div 
      className={className}
      style={{ 
        position: 'absolute',
        left: x, 
        top: y,
        zIndex: 'var(--z-popover)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, index) => (
        <button
          key={index}
          className="context-menu__item"
          onClick={() => {
            item.onClick()
            onClose()
          }}
          disabled={item.disabled}
        >
          {item.icon && <span className="context-menu__icon">{item.icon}</span>}
          <span className="context-menu__text">{item.text}</span>
        </button>
      ))}
    </div>
  )

  return createPortal(menuContent, document.body)
}

export default ContextMenu