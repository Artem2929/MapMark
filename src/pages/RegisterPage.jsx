import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../authStore'
import { RegisterForm } from '../RegisterForm'

export function RegisterPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (isAuthenticated) {
    return null
  }

  return <RegisterForm />
}