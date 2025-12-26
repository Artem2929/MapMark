import React, { memo, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProfileEditForm.css'

const ProfileEditForm = memo(({ user, onSave, onCancel }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

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
    
    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Веб-сайт повинен починатися з http:// або https://'
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
    
    setIsLoading(true)
    try {
      await onSave(formData)
      navigate('/profile')
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
      navigate('/profile')
    }
  }, [onCancel, navigate])

  return (
    <div className="profile-edit-form">
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
            autoFocus
          />
          {errors.name && <span className="profile-edit-form__error">{errors.name}</span>}
        </div>

        <div className="profile-edit-form__field">
          <label className="profile-edit-form__label">Опис</label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className={`profile-edit-form__textarea ${errors.bio ? 'profile-edit-form__textarea--error' : ''}`}
            placeholder="Розкажіть про себе"
            rows="4"
            maxLength="500"
          />
          <div className="profile-edit-form__char-count">
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
          />
        </div>

        <div className="profile-edit-form__field">
          <label className="profile-edit-form__label">Веб-сайт</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className={`profile-edit-form__input ${errors.website ? 'profile-edit-form__input--error' : ''}`}
            placeholder="https://example.com"
          />
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
            className="profile-edit-form__cancel-btn"
            disabled={isLoading}
          >
            Скасувати
          </button>
          <button
            type="submit"
            className="profile-edit-form__save-btn"
            disabled={isLoading || Object.keys(validateForm).length > 0}
          >
            {isLoading ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </form>
    </div>
  )
})

ProfileEditForm.displayName = 'ProfileEditForm'

export default ProfileEditForm