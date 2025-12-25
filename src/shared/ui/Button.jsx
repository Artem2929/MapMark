import './Button.css'

export function Button({ 
  children, 
  onClick, 
  type = 'button', 
  disabled, 
  loading,
  variant = 'primary',
  className = '',
  ...props 
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn--${variant} ${loading ? 'btn--loading' : ''} ${className}`}
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