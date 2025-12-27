import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'

// Білий список дозволених доменів
const ALLOWED_DOMAINS = [
  'localhost:3001',
  'localhost:5173',
  process.env.REACT_APP_API_DOMAIN
].filter(Boolean)

class ApiClient {
  constructor() {
    // Перевіряємо домен
    const url = new URL(API_BASE_URL)
    if (!ALLOWED_DOMAINS.includes(url.host)) {
      throw new Error('Invalid API domain')
    }

    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Для CSRF захисту
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
          // Перевіряємо формат токена
          const parts = token.split('.')
          if (parts.length === 3) {
            try {
              const payload = JSON.parse(atob(parts[1]))
              // Перевіряємо термін дії
              if (!payload.exp || payload.exp * 1000 > Date.now()) {
                config.headers.Authorization = `Bearer ${token}`
              }
            } catch (e) {
              localStorage.removeItem('accessToken')
            }
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
              const response = await this.client.post('/api/v1/auth/refresh', {
                refreshToken,
              })

              const { accessToken } = response.data
              localStorage.setItem('accessToken', accessToken)

              return this.client(originalRequest)
            }
          } catch (refreshError) {
            this.clearTokens()
            window.location.href = '/login'
          }
        }

        return Promise.reject(error)
      }
    )
  }

  clearTokens() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
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