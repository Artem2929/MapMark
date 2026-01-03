import { apiClient } from '../../../shared/api/client.js'

export const authService = {
  async login(credentials) {
    if (!credentials?.email || !credentials?.password) {
      throw new Error('Email та пароль обов\'язкові')
    }
    
    return apiClient.secureRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  },

  async register(userData) {
    if (!userData?.email || !userData?.password || !userData?.confirmPassword || !userData?.name || !userData?.surname || !userData?.country || !userData?.role) {
      throw new Error('Всі поля обов\'язкові')
    }
    
    return apiClient.secureRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        name: userData.name,
        surname: userData.surname,
        country: userData.country,
        role: userData.role
      })
    })
  },

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('Токен оновлення обов\'язковий')
    }
    
    return apiClient.request('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
  },

  async logout() {
    return apiClient.secureRequest('/auth/logout', {
      method: 'POST'
    })
  },

  async getProfile() {
    return apiClient.request('/auth/me')
  },

  async forgotPassword(email) {
    if (!email) {
      throw new Error('Email обов\'язковий')
    }
    
    return apiClient.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }
}