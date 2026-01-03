import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input } from '../../../components/ui'
import { PasswordInput } from '../../../components/ui/PasswordInput/PasswordInput'
import { PasswordStrength } from '../../../components/ui/PasswordStrength'
import { CustomSelect } from '../../../components/ui/CustomSelect'
import Skeleton from '../../../components/ui/Skeleton/Skeleton'
import { validators, validateField } from '../../../utils/validators'
import { useAuth } from '../hooks/useAuth'
import './LoginForm.css'

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'UA',
    role: '',
    acceptTerms: false,
    acceptPrivacy: false
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  const { register, loading, error, clearError } = useAuth()

  const validateName = (value) => {
    return validateField(value, [
      validators.required,
      validators.minLength(2, "Ім'я має бути мінімум 2 символи")
    ])
  }

  const validateSurname = (value) => {
    return validateField(value, [
      validators.required,
      validators.minLength(2, "Прізвище має бути мінімум 2 символи")
    ])
  }

  const validateEmail = (value) => {
    return validateField(value, [
      validators.required, 
      validators.onlyLatin('Email може містити тільки латинські символи'),
      validators.email
    ])
  }

  const validatePassword = (value) => {
    return validateField(value, [
      validators.required,
      validators.onlyLatin('Пароль може містити тільки латинські символи'),
      validators.minLength(6, 'Пароль має бути мінімум 6 символів'),
      validators.hasLowercase('Пароль має містити мінімум одну малу літеру'),
      validators.hasUppercase('Пароль має містити мінімум одну велику літеру'),
      validators.hasNumber('Пароль має містити мінімум одну цифру')
    ])
  }

  const validateConfirmPassword = (value) => {
    if (!value) return 'Підтвердіть пароль'
    if (value !== formData.password) return 'Паролі не співпадають'
    return null
  }

  const validateCountry = (value) => {
    return !value ? 'Оберіть країну' : null
  }

  const validateRole = (value) => {
    return !value ? 'Оберіть роль' : null
  }

  const validateTerms = (value) => {
    return !value ? 'Прийміть умови використання' : null
  }

  const validatePrivacy = (value) => {
    return !value ? 'Прийміть політику конфіденційності' : null
  }

  const handleFieldChange = useCallback((field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Очищаємо помилку при зміні поля
    if (error) {
      clearError()
    }
    
    if (touched[field]) {
      let fieldError = null
      switch (field) {
        case 'name': fieldError = validateName(value); break
        case 'surname': fieldError = validateSurname(value); break
        case 'email': fieldError = validateEmail(value); break
        case 'password': fieldError = validatePassword(value); break
        case 'confirmPassword': fieldError = validateConfirmPassword(value); break
        case 'country': fieldError = validateCountry(value); break
        case 'role': fieldError = validateRole(value); break
        case 'acceptTerms': fieldError = validateTerms(value); break
        case 'acceptPrivacy': fieldError = validatePrivacy(value); break
      }
      setFieldErrors(prev => ({ ...prev, [field]: fieldError }))
    }
  }, [touched, error, clearError])

  const handleFieldBlur = useCallback((field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }))
    let fieldError = null
    const value = formData[field]
    switch (field) {
      case 'name': fieldError = validateName(value); break
      case 'surname': fieldError = validateSurname(value); break
      case 'email': fieldError = validateEmail(value); break
      case 'password': fieldError = validatePassword(value); break
      case 'confirmPassword': fieldError = validateConfirmPassword(value); break
      case 'country': fieldError = validateCountry(value); break
      case 'role': fieldError = validateRole(value); break
    }
    setFieldErrors(prev => ({ ...prev, [field]: fieldError }))
  }, [formData])

  const validateAllFields = useCallback((data) => {
    return {
      name: validateName(data.name),
      surname: validateSurname(data.surname),
      email: validateEmail(data.email),
      password: validatePassword(data.password),
      confirmPassword: data.confirmPassword !== data.password ? 'Паролі не співпадають' : (!data.confirmPassword ? 'Підтвердіть пароль' : null),
      country: validateCountry(data.country),
      role: validateRole(data.role),
      acceptTerms: validateTerms(data.acceptTerms),
      acceptPrivacy: validatePrivacy(data.acceptPrivacy)
    }
  }, [])

  const isFormValid = useMemo(() => {
    const errors = validateAllFields(formData)
    return !Object.values(errors).some(error => error)
  }, [formData, validateAllFields])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    const errors = validateAllFields(formData)
    setFieldErrors(errors)
    setTouched({ 
      name: true, surname: true, email: true, password: true, confirmPassword: true, 
      country: true, role: true, acceptTerms: true, acceptPrivacy: true 
    })
    
    if (Object.values(errors).some(error => error)) {
      return
    }

    await register(formData)
  }, [formData, validateAllFields, register])

  const countries = [
    { value: 'UA', label: 'Україна' }
  ]

  const roles = [
    { value: 'user', label: 'Користувач' },
    { value: 'seller', label: 'Продавець' }
  ]

  if (loading) {
    return (
      <div className="auth-form">
        <div className="auth-form__header">
          <Skeleton width="250px" height="32px" className="mb-2" />
          <Skeleton width="180px" height="16px" />
        </div>
        <div className="auth-form__form">
          <Skeleton width="100%" height="48px" className="mb-3" />
          <Skeleton width="100%" height="48px" className="mb-3" />
          <Skeleton width="100%" height="48px" className="mb-3" />
          <Skeleton width="100%" height="48px" className="mb-3" />
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
        <h1 className="auth-form__title">Реєстрація в pinPoint</h1>
        <p className="auth-form__subtitle">Створіть новий акаунт</p>
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
          type="text"
          placeholder="Ім'я"
          value={formData.name}
          onChange={handleFieldChange('name')}
          onBlur={handleFieldBlur('name')}
          error={touched.name ? fieldErrors.name : null}
          disabled={loading}
        />
        
        <Input
          type="text"
          placeholder="Прізвище"
          value={formData.surname}
          onChange={handleFieldChange('surname')}
          onBlur={handleFieldBlur('surname')}
          error={touched.surname ? fieldErrors.surname : null}
          disabled={loading}
        />
        
        <Input
          type="email"
          placeholder="Пошта"
          value={formData.email}
          onChange={handleFieldChange('email')}
          onBlur={handleFieldBlur('email')}
          error={touched.email ? fieldErrors.email : null}
          disabled={loading}
        />
        
        <div>
          <PasswordInput
            placeholder="Пароль"
            value={formData.password}
            onChange={handleFieldChange('password')}
            onBlur={handleFieldBlur('password')}
            error={touched.password ? fieldErrors.password : null}
            disabled={loading}
          />
          <PasswordStrength password={formData.password} />
        </div>
        
        <PasswordInput
          placeholder="Підтвердіть пароль"
          value={formData.confirmPassword}
          onChange={handleFieldChange('confirmPassword')}
          onBlur={handleFieldBlur('confirmPassword')}
          error={touched.confirmPassword ? fieldErrors.confirmPassword : null}
          disabled={loading}
        />
        
        <CustomSelect
          value={formData.country}
          onChange={handleFieldChange('country')}
          onBlur={handleFieldBlur('country')}
          options={countries}
          placeholder="Оберіть країну"
          error={touched.country ? fieldErrors.country : null}
          disabled={loading}
        />
        
        <CustomSelect
          value={formData.role}
          onChange={handleFieldChange('role')}
          onBlur={handleFieldBlur('role')}
          options={roles}
          placeholder="Оберіть роль"
          error={touched.role ? fieldErrors.role : null}
          disabled={loading}
        />
        
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={handleFieldChange('acceptTerms')}
              disabled={loading}
            />
            <span>Я приймаю <Link to="/terms" target="_blank">умови використання</Link></span>
          </label>
          {fieldErrors.acceptTerms && touched.acceptTerms && (
            <span className="input__error">{fieldErrors.acceptTerms}</span>
          )}
        </div>
        
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.acceptPrivacy}
              onChange={handleFieldChange('acceptPrivacy')}
              disabled={loading}
            />
            <span>Я приймаю <Link to="/privacy" target="_blank">політику конфіденційності</Link></span>
          </label>
          {fieldErrors.acceptPrivacy && touched.acceptPrivacy && (
            <span className="input__error">{fieldErrors.acceptPrivacy}</span>
          )}
        </div>
        
        <Button
          type="submit"
          variant="success"
          loading={loading}
          disabled={!isFormValid || loading}
        >
          Зареєструватися
        </Button>
      </form>
      
      <div className="auth-form__footer">
        <p>Вже є акаунт? <Link to="/login">Увійти</Link></p>
      </div>
    </div>
  )
}