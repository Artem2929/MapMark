import { useMemo } from 'react'
import './Button.css'

export function Button({ 
  children, 
  onClick, 
  type = 'button', 
  disabled, 
  loading,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props 
}) {
  const classes = useMemo(() => {
    const baseClass = 'btn'
    const variantClass = `btn--${variant}`
    const sizeClass = `btn--${size}`
    const loadingClass = loading ? 'btn--loading' : ''
    
    return [baseClass, variantClass, sizeClass, loadingClass, className]
      .filter(Boolean)
      .join(' ')
  }, [variant, size, loading, className])

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      aria-busy={loading}
      aria-label={loading ? 'Завантаження...' : undefined}
      {...props}
    >
      {loading ? (
        <span className="btn__spinner">Завантаження...</span>
      ) : (
        children
      )}
    </button>
  )
}