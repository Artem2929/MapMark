import React, { memo, useState, useCallback, useRef, useEffect } from 'react'
import '../../styles/inline-edit.css'

const EditableField = memo(({ 
  value, 
  onSave, 
  type = 'text',
  className = '',
  placeholder = 'Натисніть для редагування',
  maxLength,
  multiline = false,
  disabled = false,
  validateFn,
  formatFn,
  variant = 'text' // title, subtitle, text, bio
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const inputRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    setEditValue(value || '')
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (type === 'text' && !multiline) {
        inputRef.current.select()
      }
      // Auto-resize textarea like VK
      if (multiline && inputRef.current) {
        inputRef.current.style.height = 'auto'
        inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
      }
    }
  }, [isEditing, type, multiline, editValue])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleEdit = useCallback((e) => {
    e.stopPropagation()
    if (disabled || isEditing) return
    setIsEditing(true)
    setError('')
    setShowSuccess(false)
  }, [disabled, isEditing])

  const handleSave = useCallback(async (e) => {
    if (e) e.stopPropagation()
    
    const trimmedValue = editValue.trim()
    
    if (validateFn) {
      const validationError = validateFn(trimmedValue)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    if (trimmedValue === (value || '').trim()) {
      setIsEditing(false)
      setError('')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await onSave(trimmedValue)
      setIsEditing(false)
      setShowSuccess(true)
      
      timeoutRef.current = setTimeout(() => {
        setShowSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err.message || 'Помилка збереження')
    } finally {
      setIsLoading(false)
    }
  }, [editValue, value, onSave, validateFn])

  const handleCancel = useCallback((e) => {
    if (e) e.stopPropagation()
    setEditValue(value || '')
    setIsEditing(false)
    setError('')
  }, [value])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    } else if (e.key === 'Enter' && multiline && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSave()
    }
  }, [handleSave, handleCancel, multiline])

  const handleInputChange = useCallback((e) => {
    setEditValue(e.target.value)
    if (error) setError('')
    
    // Auto-resize textarea like VK
    if (multiline && e.target) {
      e.target.style.height = 'auto'
      e.target.style.height = e.target.scrollHeight + 'px'
    }
  }, [error, multiline])

  const displayValue = formatFn ? formatFn(value) : value
  const isEmpty = !displayValue
  const fieldClasses = [
    'editable-field',
    `editable-field--${variant}`,
    className,
    isEditing && 'editable-field--editing',
    isLoading && 'edit-loading',
    error && 'edit-error',
    showSuccess && 'edit-success'
  ].filter(Boolean).join(' ')

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input'
    
    return (
      <div className={fieldClasses}>
        <div className="editable-field__content">
          <InputComponent
            ref={inputRef}
            type={multiline ? undefined : type}
            value={editValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={multiline ? 'inline-textarea' : 'inline-input'}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={isLoading}
          />
        </div>
        
        <div className="edit-actions">
          <button
            type="button"
            onClick={handleSave}
            className="edit-save-btn"
            disabled={isLoading}
            title="Зберегти (Enter)"
          >
            {isLoading ? 'збереження...' : 'зберегти'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="edit-cancel-btn"
            disabled={isLoading}
            title="Скасувати (Esc)"
          >
            скасувати
          </button>
        </div>
        
        {error && <div className="edit-error-message">{error}</div>}
      </div>
    )
  }

  return (
    <div className={fieldClasses} onClick={handleEdit}>
      <div className="editable-field__content">
        <span className={`editable-field__text ${isEmpty ? 'editable-field__text--empty' : ''}`}>
          {displayValue || placeholder}
        </span>
      </div>
    </div>
  )
})

EditableField.displayName = 'EditableField'

export default EditableField