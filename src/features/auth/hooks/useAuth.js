import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../app/store'
import { authService } from '../services/authService'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { setAuth, clearAuth, ...authState } = useAuthStore()
  const navigate = useNavigate()

  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)
      
      const userData = await authService.login(credentials)
      setAuth(userData)
      navigate('/', { replace: true })
      
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)
      
      const user = await authService.register(userData)
      setAuth(user)
      navigate('/', { replace: true })
      
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await authService.logout()
      clearAuth()
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    ...authState,
    login,
    register,
    logout,
    loading,
    error,
    clearError
  }
}