import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../app/store'
import { Header } from '../components/ui/Header'
import { RegisterForm } from '../features/auth/components/RegisterForm'

export function RegisterPage() {
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
      <RegisterForm />
    </div>
  )
}