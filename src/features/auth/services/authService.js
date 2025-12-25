const API_BASE_URL = 'http://localhost:3001/api'

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
  
  const requiredFields = ['email', 'name', 'country', 'role']
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
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Login failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  async register(userData) {
    try {
      validateUserData(userData)
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: userData.name,
          country: userData.country,
          role: userData.role
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Registration failed')
      }

      return await response.json()
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
      
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Token refresh error:', error)
      throw error
    }
  }
}