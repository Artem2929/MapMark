import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../app/store'
import { Header } from '../components/ui/Header'
import { LoginForm } from '../features/auth/components/LoginForm'

export function LoginPage() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="page-container">
      <Header />
      <LoginForm />
    </div>
  )
}