import { createPortal } from 'react-dom'
import { useEffect, useRef } from 'react'
import './DropdownMenu.css'

const DropdownMenu = ({ anchorRef, open, onClose, children }) => {
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose()
      }
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleFocusOut = (e) => {
      if (!menuRef.current?.contains(e.relatedTarget)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    menuRef.current?.addEventListener('focusout', handleFocusOut)

    // Focus first menu item
    const firstMenuItem = menuRef.current?.querySelector('[role="menuitem"]')
    firstMenuItem?.focus()

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      menuRef.current?.removeEventListener('focusout', handleFocusOut)
    }
  }, [open, onClose, anchorRef])

  if (!open || !anchorRef.current) return null

  const rect = anchorRef.current.getBoundingClientRect()
  const menuWidth = 180
  
  return createPortal(
    <div
      ref={menuRef}
      className="dropdown-menu"
      role="menu"
      style={{
        position: 'fixed',
        top: rect.bottom + 8,
        left: Math.max(8, rect.right - menuWidth),
        zIndex: 9999
      }}
    >
      {children}
    </div>,
    document.body
  )
}

export default DropdownMenu