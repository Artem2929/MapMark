import { useState, useEffect, createContext, useContext, useCallback } from 'react'

const AuthContext = createContext()

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false
}

const getStoredData = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? (key === 'user' ? JSON.parse(data) : data) : null
  } catch (error) {
    console.error(`Error parsing stored ${key}:`, error)
    localStorage.removeItem(key)
    return null
  }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(initialState)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = getStoredData('accessToken')
    const savedUser = getStoredData('user')
    
    if (savedToken && savedUser) {
      setState(prev => ({
        ...prev,
        accessToken: savedToken,
        user: savedUser,
        isAuthenticated: true
      }))
    }
    setIsLoading(false)
  }, [])

  const setAuth = useCallback((authData) => {
    if (!authData) return
    
    const token = authData.token || authData.accessToken
    const user = authData.data?.user || authData.user
    const refreshToken = authData.refreshToken
    
    setState(prev => ({
      ...prev,
      accessToken: token,
      refreshToken: refreshToken || prev.refreshToken,
      user: user,
      isAuthenticated: true
    }))
    
    try {
      if (token) {
        localStorage.setItem('accessToken', token)
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }
    } catch (error) {
      console.error('Error saving auth data:', error)
    }
  }, [])

  const clearAuth = useCallback(() => {
    setState(initialState)
    try {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      localStorage.removeItem('refreshToken')
    } catch (error) {
      console.error('Error clearing auth data:', error)
    }
  }, [])

  const updateUser = useCallback((userData) => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, ...userData }
    }))
    
    try {
      const updatedUser = { ...state.user, ...userData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Error updating user data:', error)
    }
  }, [state.user])

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      setAuth, 
      clearAuth, 
      updateUser,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthStore() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthStore must be used within AuthProvider')
  }
  return context
}