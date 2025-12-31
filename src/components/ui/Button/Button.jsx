import { memo, useMemo } from 'react'
import './Button.css'

const Button = memo(({ 
  children, 
  onClick, 
  type = 'button', 
  disabled, 
  loading,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props 
}) => {
  const classes = useMemo(() => {
    const baseClass = 'btn'
    const variantClass = `btn--${variant}`
    const sizeClass = `btn--${size}`
    const loadingClass = loading ? 'btn--loading' : ''
    const fullWidthClass = fullWidth ? 'btn--full-width' : ''
    
    return [baseClass, variantClass, sizeClass, loadingClass, fullWidthClass, className]
      .filter(Boolean)
      .join(' ')
  }, [variant, size, loading, fullWidth, className])

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <span className="btn__spinner" aria-hidden="true" />
          <span className="sr-only">Завантаження...</span>
        </>
      )
    }

    if (icon && iconPosition === 'left') {
      return (
        <>
          <span className="btn__icon btn__icon--left" aria-hidden="true">{icon}</span>
          {children && <span className="btn__text">{children}</span>}
        </>
      )
    }

    if (icon && iconPosition === 'right') {
      return (
        <>
          {children && <span className="btn__text">{children}</span>}
          <span className="btn__icon btn__icon--right" aria-hidden="true">{icon}</span>
        </>
      )
    }

    return children
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  )
})

Button.displayName = 'Button'

export { Button }
export default Button