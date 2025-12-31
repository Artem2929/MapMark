import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    this.setupInterceptors()
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token && this.isValidToken(token)) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.handleTokenRefresh(error)
        }
        return Promise.reject(error)
      }
    )
  }

  isValidToken(token) {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return false
      
      const payload = JSON.parse(atob(parts[1]))
      return payload.exp && payload.exp * 1000 > Date.now()
    } catch {
      return false
    }
  }

  async handleTokenRefresh(error) {
    const originalRequest = error.config
    if (originalRequest._retry) return

    originalRequest._retry = true
    const refreshToken = localStorage.getItem('refreshToken')
    
    if (!refreshToken) {
      this.clearAuth()
      return
    }

    try {
      const response = await this.client.post('/api/v1/auth/refresh', { refreshToken })
      const { accessToken } = response.data
      localStorage.setItem('accessToken', accessToken)
      return this.client(originalRequest)
    } catch {
      this.clearAuth()
    }
  }

  clearAuth() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
  }

  async get(url, config = {}) {
    const response = await this.client.get(url, config)
    return response.data
  }

  async post(url, data = {}, config = {}) {
    const response = await this.client.post(url, data, config)
    return response.data
  }

  async put(url, data = {}, config = {}) {
    const response = await this.client.put(url, data, config)
    return response.data
  }

  async delete(url, config = {}) {
    const response = await this.client.delete(url, config)
    return response.data
  }

  async patch(url, data = {}, config = {}) {
    const response = await this.client.patch(url, data, config)
    return response.data
  }
}

export const apiClient = new ApiClient()
export default apiClient