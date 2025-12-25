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
  return (
    <div className="input-wrapper">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`input ${error ? 'input--error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="input__error">{error}</span>}
    </div>
  )
}