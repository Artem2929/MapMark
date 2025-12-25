import './Input.css'

export function Input({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  onBlur,
  error,
  disabled,
  className = '',
  ...props 
}) {
  const baseClass = 'input'
  const errorClass = error ? 'input--error' : ''
  const classes = [baseClass, errorClass, className].filter(Boolean).join(' ')

  return (
    <div className="input-wrapper">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={classes}
        {...props}
      />
      {error && <span className="input__error">{error}</span>}
    </div>
  )
}