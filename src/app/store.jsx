import { useState, useEffect, createContext, useContext } from 'react'

const AuthContext = createContext()

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      setState(prev => ({
        ...prev,
        accessToken: savedToken,
        user: JSON.parse(savedUser),
        isAuthenticated: true
      }))
    }
  }, [])

  const setAuth = (authData) => {
    setState(prev => ({
      ...prev,
      ...authData,
      isAuthenticated: true
    }))
    
    if (authData.accessToken) {
      localStorage.setItem('accessToken', authData.accessToken)
    }
    if (authData.user || authData.email) {
      const userData = authData.user || authData
      localStorage.setItem('user', JSON.stringify(userData))
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