import { useState, useRef, useEffect, useMemo } from 'react'
import './CustomSelect.css'

export function CustomSelect({ 
  value, 
  onChange, 
  onBlur,
  options = [], 
  placeholder, 
  error,
  disabled,
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  const selectedOption = useMemo(() => {
    if (!options || options.length === 0) return null
    return options.find(option => option.value === value) || null
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
    if (onChange) {
      const syntheticEvent = {
        target: { value: option.value }
      }
      onChange(syntheticEvent)
    }
    setIsOpen(false)
  }

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const filteredOptions = useMemo(() => {
    return (options || []).filter(option => option.value !== '')
  }, [options])

  return (
    <div className="input-wrapper">
      <div 
        className={`custom-select ${className} ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`} 
        ref={selectRef}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div 
          className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
          onClick={handleTriggerClick}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleTriggerClick()
            }
          }}
        >
          <span className={`custom-select-value ${!selectedOption || selectedOption.value === '' ? 'placeholder' : ''}`}>
            {selectedOption && selectedOption.value !== '' ? selectedOption.label : placeholder}
          </span>
          <span className={`custom-select-arrow ${isOpen ? 'up' : 'down'}`} aria-hidden="true">▼</span>
        </div>
        
        {isOpen && !disabled && (
          <div className="custom-select-dropdown" role="listbox">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option)}
                role="option"
                aria-selected={value === option.value}
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