import { useState } from 'react'
import { useAuth } from './authStore'
import { useNavigate, Link } from 'react-router-dom'
import { validators, validateField } from './validators'
import './register.css'

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    role: 'user',
    acceptTerms: false,
    acceptPrivacy: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  const validateName = (value) => {
    return validateField(value, [
      validators.required,
      validators.minLength(2, "Ім'я має бути мінімум 2 символи")
    ])
  }

  const validateEmail = (value) => {
    return validateField(value, [
      validators.required,
      validators.email
    ])
  }

  const validatePassword = (value) => {
    return validateField(value, [
      validators.required,
      validators.minLength(6, 'Пароль має бути мінімум 6 символів')
    ])
  }

  const validateConfirmPassword = (value) => {
    if (!value) return "Підтвердіть пароль"
    if (value !== formData.password) return "Паролі не співпадають"
    return null
  }

  const validateCountry = (value) => {
    return !value ? "Оберіть країну" : null
  }

  const validateTerms = (value) => {
    return !value ? "Прийміть умови використання" : null
  }

  const validatePrivacy = (value) => {
    return !value ? "Прийміть політику конфіденційності" : null
  }

  const handleFieldChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (touched[field]) {
      let fieldError = null
      switch (field) {
        case 'name': fieldError = validateName(value); break
        case 'email': fieldError = validateEmail(value); break
        case 'password': fieldError = validatePassword(value); break
        case 'confirmPassword': fieldError = validateConfirmPassword(value); break
        case 'country': fieldError = validateCountry(value); break
        case 'acceptTerms': fieldError = validateTerms(value); break
        case 'acceptPrivacy': fieldError = validatePrivacy(value); break
      }
      setFieldErrors(prev => ({ ...prev, [field]: fieldError }))
    }
  }

  const handleFieldBlur = (field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }))
    let fieldError = null
    switch (field) {
      case 'name': fieldError = validateName(formData[field]); break
      case 'email': fieldError = validateEmail(formData[field]); break
      case 'password': fieldError = validatePassword(formData[field]); break
      case 'confirmPassword': fieldError = validateConfirmPassword(formData[field]); break
      case 'country': fieldError = validateCountry(formData[field]); break
    }
    setFieldErrors(prev => ({ ...prev, [field]: fieldError }))
  }

  const isFormValid = () => {
    const nameError = validateName(formData.name)
    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword)
    const countryError = validateCountry(formData.country)
    const termsError = validateTerms(formData.acceptTerms)
    const privacyError = validatePrivacy(formData.acceptPrivacy)
    
    return !nameError && !emailError && !passwordError && !confirmPasswordError && 
           !countryError && !termsError && !privacyError
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const nameError = validateName(formData.name)
    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword)
    const countryError = validateCountry(formData.country)
    const termsError = validateTerms(formData.acceptTerms)
    const privacyError = validatePrivacy(formData.acceptPrivacy)
    
    setFieldErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      country: countryError,
      acceptTerms: termsError,
      acceptPrivacy: privacyError
    })
    setTouched({ 
      name: true, email: true, password: true, confirmPassword: true, 
      country: true, acceptTerms: true, acceptPrivacy: true 
    })
    
    if (nameError || emailError || passwordError || confirmPasswordError || 
        countryError || termsError || privacyError) {
      return
    }

    setLoading(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser = { 
        email: formData.email, 
        name: formData.name,
        country: formData.country,
        role: formData.role,
        accessToken: 'mock-token'
      }
      setAuth(mockUser)
      navigate('/', { replace: true })
    } catch (err) {
      setError('Помилка реєстрації')
    } finally {
      setLoading(false)
    }
  }

  const countries = [
    { value: 'UA', label: 'Україна' },
    { value: 'US', label: 'США' },
    { value: 'DE', label: 'Німеччина' },
    { value: 'FR', label: 'Франція' },
    { value: 'PL', label: 'Польща' }
  ]

  const roles = [
    { value: 'user', label: 'Користувач' },
    { value: 'seller', label: 'Продавець' }
  ]

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-form-wrapper">
          <h1 className="register-title">Реєстрація в MapMark</h1>
          <p className="register-subtitle">Створіть новий акаунт</p>
          
          <div className="error-container">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Ім'я"
                value={formData.name}
                onChange={handleFieldChange('name')}
                onBlur={handleFieldBlur('name')}
                className={`input ${fieldErrors.name && touched.name ? 'input--error' : ''}`}
                disabled={loading}
              />
              {fieldErrors.name && touched.name && (
                <span className="input__error">{fieldErrors.name}</span>
              )}
            </div>
            
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleFieldChange('email')}
                onBlur={handleFieldBlur('email')}
                className={`input ${fieldErrors.email && touched.email ? 'input--error' : ''}`}
                disabled={loading}
              />
              {fieldErrors.email && touched.email && (
                <span className="input__error">{fieldErrors.email}</span>
              )}
            </div>
            
            <div className="input-wrapper password-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Пароль"
                value={formData.password}
                onChange={handleFieldChange('password')}
                onBlur={handleFieldBlur('password')}
                className={`input ${fieldErrors.password && touched.password ? 'input--error' : ''}`}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👀' : '🙈'}
              </button>
              {fieldErrors.password && touched.password && (
                <span className="input__error">{fieldErrors.password}</span>
              )}
            </div>
            
            <div className="input-wrapper password-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Підтвердіть пароль"
                value={formData.confirmPassword}
                onChange={handleFieldChange('confirmPassword')}
                onBlur={handleFieldBlur('confirmPassword')}
                className={`input ${fieldErrors.confirmPassword && touched.confirmPassword ? 'input--error' : ''}`}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '👀' : '🙈'}
              </button>
              {fieldErrors.confirmPassword && touched.confirmPassword && (
                <span className="input__error">{fieldErrors.confirmPassword}</span>
              )}
            </div>
            
            <div className="input-wrapper">
              <select
                value={formData.country}
                onChange={handleFieldChange('country')}
                onBlur={handleFieldBlur('country')}
                className={`input ${fieldErrors.country && touched.country ? 'input--error' : ''}`}
                disabled={loading}
              >
                <option value="">Оберіть країну</option>
                {countries.map(country => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
              {fieldErrors.country && touched.country && (
                <span className="input__error">{fieldErrors.country}</span>
              )}
            </div>
            
            <div className="input-wrapper">
              <select
                value={formData.role}
                onChange={handleFieldChange('role')}
                className="input"
                disabled={loading}
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="checkbox-group">
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleFieldChange('acceptTerms')}
                  disabled={loading}
                />
                <span>Я приймаю <Link to="/terms" target="_blank">умови використання</Link></span>
              </div>
              {fieldErrors.acceptTerms && touched.acceptTerms && (
                <span className="input__error">{fieldErrors.acceptTerms}</span>
              )}
            </div>
            
            <div className="checkbox-group">
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  checked={formData.acceptPrivacy}
                  onChange={handleFieldChange('acceptPrivacy')}
                  disabled={loading}
                />
                <span>Я приймаю <Link to="/privacy" target="_blank">політику конфіденційності</Link></span>
              </div>
              {fieldErrors.acceptPrivacy && touched.acceptPrivacy && (
                <span className="input__error">{fieldErrors.acceptPrivacy}</span>
              )}
            </div>
            
            <button
              type="submit"
              className="register-btn"
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <div className="btn-loading">
                  <div className="btn-spinner"></div>
                  Завантаження...
                </div>
              ) : (
                'Зареєструватися'
              )}
            </button>
          </form>
          
          <div className="register-footer">
            <p>Вже є акаунт? <Link to="/login">Увійти</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}