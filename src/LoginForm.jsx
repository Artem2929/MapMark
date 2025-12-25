import { useState } from 'react'
import { useAuth } from './authStore'
import { useNavigate } from 'react-router-dom'
import { validators, validateField } from './validators'
import './styles.css'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  
  const { setAuth } = useAuth()
  const navigate = useNavigate()

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

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    if (touched.email) {
      const emailError = validateEmail(value)
      setFieldErrors(prev => ({ ...prev, email: emailError }))
    }
  }

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)
    if (touched.password) {
      const passwordError = validatePassword(value)
      setFieldErrors(prev => ({ ...prev, password: passwordError }))
    }
  }

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }))
    const emailError = validateEmail(email)
    setFieldErrors(prev => ({ ...prev, email: emailError }))
  }

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }))
    const passwordError = validatePassword(password)
    setFieldErrors(prev => ({ ...prev, password: passwordError }))
  }

  const isFormValid = () => {
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    return !emailError && !passwordError
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Валідуємо всі поля
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    
    setFieldErrors({ email: emailError, password: passwordError })
    setTouched({ email: true, password: true })
    
    if (emailError || passwordError) {
      return
    }

    setLoading(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser = { 
        email, 
        name: 'Test User',
        accessToken: 'mock-token'
      }
      setAuth(mockUser)
      navigate('/', { replace: true })
    } catch (err) {
      setError('Помилка входу')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {error && (
        <div className="form-error">
          {error}
        </div>
      )}
      
      <div className="input-wrapper">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
          className={`input ${fieldErrors.email && touched.email ? 'input--error' : ''}`}
          disabled={loading}
        />
        {fieldErrors.email && touched.email && (
          <span className="input__error">{fieldErrors.email}</span>
        )}
      </div>
      
      <div className="input-wrapper">
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={handlePasswordChange}
          onBlur={handlePasswordBlur}
          className={`input ${fieldErrors.password && touched.password ? 'input--error' : ''}`}
          disabled={loading}
        />
        {fieldErrors.password && touched.password && (
          <span className="input__error">{fieldErrors.password}</span>
        )}
      </div>
      
      <button
        type="submit"
        className="btn btn--primary"
        disabled={loading || !isFormValid()}
      >
        {loading ? 'Завантаження...' : 'Увійти'}
      </button>
    </form>
  )
}