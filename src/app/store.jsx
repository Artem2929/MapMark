import { useState, useEffect, createContext, useContext } from 'react'

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
  }, [])

  const setAuth = (authData) => {
    if (!authData) return
    
    setState(prev => ({
      ...prev,
      ...authData,
      isAuthenticated: true
    }))
    
    try {
      if (authData.accessToken) {
        localStorage.setItem('accessToken', authData.accessToken)
      }
      if (authData.user || authData.email) {
        const userData = authData.user || authData
        localStorage.setItem('user', JSON.stringify(userData))
      }
    } catch (error) {
      console.error('Error saving auth data:', error)
    }
  }

  const clearAuth = () => {
    setState(initialState)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
  }

  return (
    <AuthContext.Provider value={{ ...state, setAuth, clearAuth }}>
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