import { useState, useEffect, createContext, useContext } from 'react'

const AuthContext = createContext()

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false
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

  const actions = {
    setAuth: (authData) => {
      setState(prev => ({
        ...prev,
        ...authData,
        isAuthenticated: true
      }))
      
      if (authData.accessToken) {
        localStorage.setItem('accessToken', authData.accessToken)
      }
      if (authData.user) {
        localStorage.setItem('user', JSON.stringify(authData.user))
      }
    },

    clearAuth: () => {
      setState(initialState)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    },

    setLoading: (loading) => {
      setState(prev => ({ ...prev, loading }))
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, ...actions }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}