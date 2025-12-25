import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input } from '../../../components/ui'
import { PasswordInput } from '../../../components/ui/PasswordInput/PasswordInput'
import { CustomSelect } from '../../../components/ui/CustomSelect'
import { validators, validateField } from '../../../utils/validators'
import { useAuth } from '../hooks/useAuth'
import './LoginForm.css'

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
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

  const validateEmail = (value) => {
    return validateField(value, [validators.required, validators.email])
  }

  const validatePassword = (value) => {
    return validateField(value, [
      validators.required,
      validators.minLength(6, 'Пароль має бути мінімум 6 символів')
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

  const validateTerms = (value) => {
    return !value ? 'Прийміть умови використання' : null
  }

  const validatePrivacy = (value) => {
    return !value ? 'Прийміть політику конфіденційності' : null
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
    clearError()
    
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

    await register(formData)
  }

  const countries = [
    { value: 'UA', label: 'Україна' }
  ]

  const roles = [
    { value: 'user', label: 'Користувач' },
    { value: 'seller', label: 'Продавець' }
  ]

  return (
    <div className="auth-form">
      <div className="auth-form__header">
        <h1 className="auth-form__title">Реєстрація в MapMark</h1>
        <p className="auth-form__subtitle">Створіть новий акаунт</p>
      </div>
      
      {error && (
        <div className="auth-form__error">
          {error}
        </div>
      )}
      
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
          options={roles}
          placeholder="Оберіть роль"
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
          disabled={!isFormValid() || loading}
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