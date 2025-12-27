import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor для додавання токена
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor для обробки помилок
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
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
          }
        }

        return Promise.reject(error)
      }
    )
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