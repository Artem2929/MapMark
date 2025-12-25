import { useState } from 'react'
import '../Input/Input.css'
import './PasswordInput.css'

export function PasswordInput({ 
  placeholder, 
  value, 
  onChange, 
  onBlur,
  error,
  disabled,
  className = '',
  ...props 
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="input-wrapper password-group">
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`input ${error ? 'input--error' : ''} ${className}`}
        {...props}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Приховати пароль" : "Показати пароль"}
        aria-pressed={showPassword}
      >
        {showPassword ? '👀' : '🙈'}
      </button>
      {error && <span className="input__error">{error}</span>}
    </div>
  )
}