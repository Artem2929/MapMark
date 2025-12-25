import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../authStore'
import { LoginForm } from '../LoginForm'
import './LoginPage.css'

export function LoginPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Редірект якщо вже авторизований
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (isAuthenticated) {
    return null // або loader
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form-wrapper">
          <h1 className="login-title">Вхід до MapMark</h1>
          <p className="login-subtitle">Увійдіть до свого акаунту</p>
          <LoginForm />
          
          <div className="login-footer">
            <p>Немає акаунту? <Link to="/register">Зареєструватися</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}