import { useState, useEffect, useCallback } from 'react'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const getCurrentUser = useCallback(() => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setLoading(false)
        return null
      }

      // Перевіряємо формат токена
      const parts = token.split('.')
      if (parts.length !== 3) {
        localStorage.removeItem('accessToken')
        setUser(null)
        setLoading(false)
        return null
      }

      const payload = JSON.parse(atob(parts[1]))
      
      // Перевіряємо термін дії токена
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setUser(null)
        setLoading(false)
        return null
      }
      
      const currentUser = {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role
      }
      
      setUser(currentUser)
      setLoading(false)
      return currentUser
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error parsing token:', error)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
      setLoading(false)
      return null
    }
  }, [])

  useEffect(() => {
    getCurrentUser()
  }, [getCurrentUser])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }, [])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    refreshUser: getCurrentUser
  }
}