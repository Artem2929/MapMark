import { useState, useRef, useEffect } from 'react'
import './CustomSelect.css'

export function CustomSelect({ 
  value, 
  onChange, 
  onBlur,
  options, 
  placeholder, 
  error,
  disabled,
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const selectRef = useRef(null)

  useEffect(() => {
    if (options && options.length > 0) {
      const selected = options.find(option => option.value === value)
      setSelectedOption(selected || null)
    }
  }, [value, options])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
        if (onBlur) onBlur()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onBlur])

  const handleOptionClick = (option) => {
    const syntheticEvent = {
      target: { value: option.value }
    }
    onChange(syntheticEvent)
    setIsOpen(false)
  }

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className="input-wrapper">
      <div 
        className={`custom-select ${className} ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`} 
        ref={selectRef}
      >
        <div 
          className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
          onClick={handleTriggerClick}
        >
          <span className={`custom-select-value ${!selectedOption || selectedOption.value === '' ? 'placeholder' : ''}`}>
            {selectedOption && selectedOption.value !== '' ? selectedOption.label : placeholder}
          </span>
          <span className={`custom-select-arrow ${isOpen ? 'up' : 'down'}`}>▼</span>
        </div>
        
        {isOpen && !disabled && (
          <div className="custom-select-dropdown">
            {options.filter(option => option.value !== '').map((option) => (
              <div
                key={option.value}
                className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <span className="input__error">{error}</span>}
    </div>
  )
}