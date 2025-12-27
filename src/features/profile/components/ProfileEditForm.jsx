import React, { memo, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProfileEditForm.css'

const ProfileEditForm = memo(({ user, onSave, onCancel }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const handleTextareaChange = useCallback((e) => {
    const value = e.target.value
    handleInputChange('bio', value)
    
    // Auto-resize textarea
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }, [handleInputChange])

  const getCharCountClass = useCallback((length, max) => {
    const percentage = (length / max) * 100
    if (percentage >= 90) return 'profile-edit-form__char-count--error'
    if (percentage >= 75) return 'profile-edit-form__char-count--warning'
    return ''
  }, [])

  const validateForm = useMemo(() => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Ім'я обов'язкове"
    } else if (formData.name.length < 2) {
      newErrors.name = "Ім'я повинно містити мінімум 2 символи"
    }
    
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Опис не може перевищувати 500 символів'
    }
    
    if (formData.website && formData.website.trim() && !formData.website.match(/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i)) {
      newErrors.website = 'Введіть коректний веб-сайт (наприклад: example.com або https://example.com)'
    }
    
    return newErrors
  }, [formData])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    // Автоматично додаємо https:// до website якщо протокол не вказано
    const processedFormData = {
      ...formData,
      website: formData.website && !formData.website.match(/^https?:\/\//) 
        ? `https://${formData.website}` 
        : formData.website
    }
    
    setIsLoading(true)
    setShowSuccess(false)
    try {
      await onSave(processedFormData)
      setShowSuccess(true)
      setTimeout(() => {
        navigate(`/profile/${user.id}`)
      }, 800)
    } catch (error) {
      setErrors({ submit: error.message || 'Помилка збереження профілю' })
    } finally {
      setIsLoading(false)
    }
  }, [formData, validateForm, onSave, navigate])

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel()
    } else {
      navigate(`/profile/${user.id}`)
    }
  }, [onCancel, navigate, user.id])

  return (
    <div className={`profile-edit-form ${showSuccess ? 'profile-edit-form--success' : ''}`}>
      <div className="profile-edit-form__header">
        <h2 className="profile-edit-form__title">Редагувати профіль</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="profile-edit-form__form">
        <div className="profile-edit-form__field">
          <label className="profile-edit-form__label">Ім'я *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`profile-edit-form__input ${errors.name ? 'profile-edit-form__input--error' : ''}`}
            placeholder="Введіть ваше ім'я"
            maxLength="50"
            autoFocus
            disabled={isLoading}
          />
          <div className={`profile-edit-form__char-count ${getCharCountClass(formData.name.length, 50)}`}>
            {formData.name.length}/50
          </div>
          {errors.name && <span className="profile-edit-form__error">{errors.name}</span>}
        </div>

        <div className="profile-edit-form__field">
          <label className="profile-edit-form__label">Прізвище</label>
          <input
            type="text"
            value={formData.surname}
            onChange={(e) => handleInputChange('surname', e.target.value)}
            className="profile-edit-form__input"
            placeholder="Введіть ваше прізвище"
            maxLength="50"
            disabled={isLoading}
          />
          <div className={`profile-edit-form__char-count ${getCharCountClass(formData.surname.length, 50)}`}>
            {formData.surname.length}/50
          </div>
        </div>

        <div className="profile-edit-form__field">
          <label className="profile-edit-form__label">Опис</label>
          <textarea
            value={formData.bio}
            onChange={handleTextareaChange}
            className={`profile-edit-form__textarea ${errors.bio ? 'profile-edit-form__textarea--error' : ''}`}
            placeholder="Розкажіть про себе"
            rows="1"
            maxLength="500"
            disabled={isLoading}
            style={{ minHeight: '48px', resize: 'none', overflow: 'hidden' }}
          />
          <div className={`profile-edit-form__char-count ${getCharCountClass(formData.bio.length, 500)}`}>
            {formData.bio.length}/500
          </div>
          {errors.bio && <span className="profile-edit-form__error">{errors.bio}</span>}
        </div>

        <div className="profile-edit-form__field">
          <label className="profile-edit-form__label">Місцезнаходження</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="profile-edit-form__input"
            placeholder="Місто, країна"
            maxLength="100"
            disabled={isLoading}
          />
          <div className={`profile-edit-form__char-count ${getCharCountClass(formData.location.length, 100)}`}>
            {formData.location.length}/100
          </div>
        </div>

        <div className="profile-edit-form__field">
          <label className="profile-edit-form__label">Веб-сайт</label>
          <input
            type="text"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className={`profile-edit-form__input ${errors.website ? 'profile-edit-form__input--error' : ''}`}
            placeholder="example.com"
            maxLength="100"
            disabled={isLoading}
          />
          <div className={`profile-edit-form__char-count ${getCharCountClass(formData.website.length, 100)}`}>
            {formData.website.length}/100
          </div>
          {errors.website && <span className="profile-edit-form__error">{errors.website}</span>}
        </div>

        {errors.submit && (
          <div className="profile-edit-form__submit-error">
            {errors.submit}
          </div>
        )}

        <div className="profile-edit-form__actions">
          <button
            type="button"
            onClick={handleCancel}
            className="profile-edit-form__btn profile-edit-form__btn--cancel"
            disabled={isLoading}
          >
            Скасувати
          </button>
          <button
            type="submit"
            className={`profile-edit-form__btn profile-edit-form__btn--save ${isLoading ? 'profile-edit-form__btn--loading' : ''}`}
            disabled={isLoading || Object.keys(validateForm).length > 0}
          >
            {isLoading ? '' : showSuccess ? 'Збережено!' : 'Зберегти'}
          </button>
        </div>
      </form>
    </div>
  )
})

ProfileEditForm.displayName = 'ProfileEditForm'

export default ProfileEditForm