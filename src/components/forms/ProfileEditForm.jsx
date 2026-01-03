import { memo, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { validateProfileForm, normalizeWebsite } from '../../shared/utils/validation'
import './ProfileEditForm.css'
import './PhotoUploadModal.css'
import '../../features/profile/components/WallPost.css'

const ProfileEditForm = memo(({ user, onSave, onCancel }) => {
  const navigate = useNavigate()
  const textareaRef = useRef(null)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    birthDate: user?.birthDate || '',
    email: user?.email || '',
    position: user?.position || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    visibility: {
      birthDate: user?.visibility?.birthDate ?? true,
      email: user?.visibility?.email ?? true,
      position: user?.visibility?.position ?? true,
      location: user?.visibility?.location ?? true,
      website: user?.visibility?.website ?? true
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Auto-resize textarea on mount and when bio changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [formData.bio])

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const handleVisibilityChange = useCallback((field) => {
    setFormData(prev => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [field]: !prev.visibility[field]
      }
    }))
  }, [])

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
    const validation = validateProfileForm(formData)
    return validation.errors
  }, [formData])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    const processedFormData = {
      ...formData,
      website: normalizeWebsite(formData.website)
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
  }, [formData, validateForm, onSave, navigate, user.id])

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel()
    } else {
      navigate(`/profile/${user.id}`)
    }
  }, [onCancel, navigate, user.id])

  return (
    <div className="profile-edit-modal">
      <div className="profile-edit-modal__content">
        <header className="profile-edit-modal__header">
          <h2>Редагувати профіль</h2>
          <button className="profile-edit-modal__close" onClick={handleCancel} aria-label="Закрити">✕</button>
        </header>
        
        <form onSubmit={handleSubmit} className="profile-edit-modal__body">
          {errors.submit && (
            <div className="error-messages">
              <div className="error-message">{errors.submit}</div>
            </div>
          )}
          
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
            <div className="profile-edit-form__field-header">
              <label className="profile-edit-form__label">Дата народження</label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.visibility.birthDate}
                  onChange={() => handleVisibilityChange('birthDate')}
                  disabled={isLoading}
                />
                <span>Відображати в профілі</span>
              </label>
            </div>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              className={`profile-edit-form__input ${errors.birthDate ? 'profile-edit-form__input--error' : ''}`}
              disabled={isLoading}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.birthDate && <span className="profile-edit-form__error">{errors.birthDate}</span>}
          </div>

          <div className="profile-edit-form__field">
            <div className="profile-edit-form__field-header">
              <label className="profile-edit-form__label">Email</label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.visibility.email}
                  onChange={() => handleVisibilityChange('email')}
                  disabled={isLoading}
                />
                <span>Відображати в профілі</span>
              </label>
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`profile-edit-form__input ${errors.email ? 'profile-edit-form__input--error' : ''}`}
              placeholder="example@email.com"
              maxLength="50"
              disabled={isLoading}
            />
            <div className={`profile-edit-form__char-count ${getCharCountClass(formData.email.length, 50)}`}>
              {formData.email.length}/50
            </div>
            {errors.email && <span className="profile-edit-form__error">{errors.email}</span>}
          </div>

          <div className="profile-edit-form__field">
            <div className="profile-edit-form__field-header">
              <label className="profile-edit-form__label">Посада</label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.visibility.position}
                  onChange={() => handleVisibilityChange('position')}
                  disabled={isLoading}
                />
                <span>Відображати в профілі</span>
              </label>
            </div>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              className="profile-edit-form__input"
              placeholder="Наприклад: Senior Frontend Developer"
              maxLength="100"
              disabled={isLoading}
            />
            <div className={`profile-edit-form__char-count ${getCharCountClass(formData.position.length, 100)}`}>
              {formData.position.length}/100
            </div>
          </div>

          <div className="profile-edit-form__field">
            <label className="profile-edit-form__label">Опис</label>
            <textarea
              ref={textareaRef}
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
            <div className="profile-edit-form__field-header">
              <label className="profile-edit-form__label">Місцезнаходження</label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.visibility.location}
                  onChange={() => handleVisibilityChange('location')}
                  disabled={isLoading}
                />
                <span>Відображати в профілі</span>
              </label>
            </div>
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
            <div className="profile-edit-form__field-header">
              <label className="profile-edit-form__label">Веб-сайт</label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.visibility.website}
                  onChange={() => handleVisibilityChange('website')}
                  disabled={isLoading}
                />
                <span>Відображати в профілі</span>
              </label>
            </div>
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

          <div className="wall-post__edit-buttons">
            <button
              type="button"
              onClick={handleCancel}
              className="btn secondary"
              disabled={isLoading}
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="btn primary"
              disabled={isLoading || Object.keys(validateForm).length > 0}
            >
              {isLoading ? 'Збереження...' : showSuccess ? 'Збережено!' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})

ProfileEditForm.displayName = 'ProfileEditForm'

export default ProfileEditForm