import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input } from '../../../components/ui'
import { PasswordInput } from '../../../components/ui/PasswordInput/PasswordInput'
import Skeleton from '../../../components/ui/Skeleton/Skeleton'
import { validators, validateField } from '../../../utils/validators'
import { useAuth } from '../hooks/useAuth'
import './LoginForm.css'

export function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  const { login, loading, error, clearError } = useAuth()

  const validateEmail = useCallback((value) => {
    return validateField(value, [
      validators.required, 
      validators.onlyLatin('Email може містити тільки латинські символи'),
      validators.email
    ])
  }, [])

  const validatePassword = useCallback((value) => {
    return validateField(value, [
      validators.required,
      validators.onlyLatin('Пароль може містити тільки латинські символи'),
      validators.minLength(6, 'Пароль має бути мінімум 6 символів')
    ])
  }, [])

  const handleFieldChange = (field) => (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (touched[field]) {
      const fieldError = field === 'email' ? validateEmail(value) : validatePassword(value)
      setFieldErrors(prev => ({ ...prev, [field]: fieldError }))
    }
  }

  const handleFieldBlur = (field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const fieldError = field === 'email' ? validateEmail(formData[field]) : validatePassword(formData[field])
    setFieldErrors(prev => ({ ...prev, [field]: fieldError }))
  }

  const isFormValid = useMemo(() => {
    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)
    return !emailError && !passwordError
  }, [formData.email, formData.password, validateEmail, validatePassword])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!isFormValid) return
    
    await login(formData)
  }, [formData, isFormValid, login])

  if (loading) {
    return (
      <div className="auth-form">
        <div className="auth-form__header">
          <Skeleton width="200px" height="32px" className="mb-2" />
          <Skeleton width="150px" height="16px" />
        </div>
        <div className="auth-form__form">
          <Skeleton width="100%" height="48px" className="mb-3" />
          <Skeleton width="100%" height="48px" className="mb-3" />
          <Skeleton width="100%" height="48px" />
        </div>
      </div>
    )
  }

  return (
    <div className="auth-form">
      <div className="auth-form__header">
        <h1 className="auth-form__title">Вхід до pinPoint</h1>
        <p className="auth-form__subtitle">Увійдіть до свого акаунту</p>
      </div>
      
      <div className={`auth-form__error-container ${error ? 'has-error' : ''}`}>
        {error && (
          <div className="auth-form__error">
            {error}
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="auth-form__form">
        <Input
          type="email"
          placeholder="Пошта"
          value={formData.email}
          onChange={handleFieldChange('email')}
          onBlur={handleFieldBlur('email')}
          error={touched.email ? fieldErrors.email : null}
          disabled={loading}
        />
        
        <PasswordInput
          placeholder="Пароль"
          value={formData.password}
          onChange={handleFieldChange('password')}
          onBlur={handleFieldBlur('password')}
          error={touched.password ? fieldErrors.password : null}
          disabled={loading}
        />
        
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!isFormValid || loading}
        >
          Увійти
        </Button>
      </form>
      
      <div className="auth-form__footer">
        <p>Немає акаунту? <Link to="/register">Зареєструватися</Link></p>
      </div>
    </div>
  )
}