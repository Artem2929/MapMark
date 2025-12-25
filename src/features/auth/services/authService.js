const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api/v1'

let csrfToken = null

const getCSRFToken = async () => {
  if (!csrfToken) {
    const response = await fetch(`${API_BASE_URL}/auth/csrf-token`, {
      credentials: 'include'
    })
    const data = await response.json()
    csrfToken = data.csrfToken
  }
  return csrfToken
}

const validateCredentials = (credentials) => {
  if (!credentials || typeof credentials !== 'object') {
    throw new Error('Credentials are required')
  }
  if (!credentials.email) {
    throw new Error('Email is required')
  }
  if (!credentials.password) {
    throw new Error('Password is required')
  }
}

const validateUserData = (userData) => {
  if (!userData || typeof userData !== 'object') {
    throw new Error('User data is required')
  }
  
  const requiredFields = ['email', 'name', 'country', 'password']
  for (const field of requiredFields) {
    if (!userData[field]) {
      throw new Error(`${field} is required`)
    }
  }
}

export const authService = {
  async login(credentials) {
    try {
      validateCredentials(credentials)
      
      const token = await getCSRFToken()
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': token
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  async register(userData) {
    try {
      validateUserData(userData)
      
      const token = await getCSRFToken()
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': token
        },
        credentials: 'include',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword || userData.password,
          name: userData.name,
          country: userData.country,
          role: userData.role || 'user'
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      return data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  },

  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token is required')
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed')
      }

      return data
    } catch (error) {
      console.error('Token refresh error:', error)
      throw error
    }
  },

  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Logout failed')
      }

      return data
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  },

  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get profile')
      }

      return data
    } catch (error) {
      console.error('Get profile error:', error)
      throw error
    }
  },

  async forgotPassword(email) {
    try {
      if (!email) {
        throw new Error('Email is required')
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed')
      }

      return data
    } catch (error) {
      console.error('Forgot password error:', error)
      throw error
    }
  }
}