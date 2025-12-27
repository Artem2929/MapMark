import React from 'react'
import './FormField.css'

const FormField = ({ 
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  disabled,
  error,
  maxLength,
  showCounter = false,
  autoResize = false,
  className = '',
  ...props 
}) => {
  const isTextarea = type === 'textarea'
  const Component = isTextarea ? 'textarea' : 'input'
  
  const handleChange = (e) => {
    onChange(e)
    
    if (autoResize && isTextarea) {
      e.target.style.height = 'auto'
      e.target.style.height = e.target.scrollHeight + 'px'
    }
  }

  const inputProps = {
    value,
    onChange: handleChange,
    placeholder,
    required,
    disabled,
    className: `form-field ${error ? 'form-field--error' : ''} ${className}`,
    maxLength,
    ...props
  }

  if (!isTextarea) {
    inputProps.type = type
  }

  if (isTextarea && autoResize) {
    inputProps.style = { minHeight: '100px', ...props.style }
  }

  return (
    <div className="form-field-wrapper">
      <Component {...inputProps} />
      
      {showCounter && maxLength && (
        <div className="form-counter">
          <span className={value.length > maxLength ? 'form-counter--error' : ''}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}
      
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

export { FormField }
export default FormField