import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './authStore'

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)
      
      // Заглушка для API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Симуляція успішного логіну
      const mockUser = { 
        email: credentials.email, 
        name: 'Test User',
        accessToken: 'mock-token'
      }
      
      setAuth(mockUser)
      navigate('/', { replace: true })
      
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    login,
    loading,
    error,
    clearError
  }
}