import { apiClient } from './apiClient'

class CSRFService {
  constructor() {
    this.token = null
  }

  async getToken() {
    if (!this.token) {
      await this.refreshToken()
    }
    return this.token
  }

  async refreshToken() {
    try {
      const response = await apiClient.get('/api/v1/auth/csrf-token')
      this.token = response.data.csrfToken
      return this.token
    } catch (error) {
      console.error('Failed to get CSRF token:', error)
      throw error
    }
  }

  async makeSecureRequest(url, options = {}) {
    const token = await this.getToken()
    
    const secureOptions = {
      ...options,
      headers: {
        ...options.headers,
        'X-CSRF-Token': token
      }
    }

    try {
      return await apiClient.request(url, secureOptions)
    } catch (error) {
      // If CSRF token is invalid, refresh and retry once
      if (error.message.includes('CSRF') || error.message.includes('403')) {
        await this.refreshToken()
        const newToken = await this.getToken()
        
        secureOptions.headers['X-CSRF-Token'] = newToken
        return await apiClient.request(url, secureOptions)
      }
      throw error
    }
  }
}

export const csrfService = new CSRFService()