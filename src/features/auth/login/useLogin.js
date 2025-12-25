import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../entities/auth/model/authStore.jsx'
import { authApi } from '../../../entities/auth/api/authApi.js'

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)
      
      const authData = await authApi.login(credentials)
      
      setAuth(authData)
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