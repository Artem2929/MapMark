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
  const baseClass = 'btn'
  const variantClass = `btn--${variant}`
  const sizeClass = `btn--${size}`
  const loadingClass = loading ? 'btn--loading' : ''
  
  const classes = [baseClass, variantClass, sizeClass, loadingClass, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading ? (
        <span className="btn__spinner">Loading</span>
      ) : (
        children
      )}
    </button>
  )
}