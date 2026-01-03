const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL environment variable is required')
}

let csrfToken = null

const getCSRFToken = async (forceRefresh = false) => {
  if (!csrfToken || forceRefresh) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/csrf-token`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Не вдалося отримати CSRF токен')
      }
      
      const data = await response.json()
      csrfToken = data.data?.csrfToken || data.csrfToken
    } catch (error) {
      console.error('Failed to get CSRF token:', error)
      throw error
    }
  }
  return csrfToken
}

export const apiClient = {
  async request(url, options = {}) {
    // Отримуємо токен з localStorage
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      credentials: 'include'
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Помилка запиту')
    }

    return data
  },

  async secureRequest(url, options = {}) {
    const token = localStorage.getItem('accessToken')
    const csrfToken = await getCSRFToken()
    
    // Don't set Content-Type for FormData (multipart)
    const headers = { ...options.headers }
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'X-CSRF-Token': csrfToken,
        ...headers
      },
      credentials: 'include'
    })

    if (response.status === 403) {
      const errorData = await response.clone().json().catch(() => ({}))
      if (errorData.code === 'INVALID_CSRF_TOKEN') {
        const newToken = await getCSRFToken(true)
        
        const retryResponse = await fetch(`${API_BASE_URL}${url}`, {
          ...options,
          headers: {
            'X-CSRF-Token': newToken,
            ...headers
          },
          credentials: 'include'
        })
        
        const retryData = await retryResponse.json().catch(() => ({ message: 'Invalid response format' }))
        
        if (!retryResponse.ok) {
          throw new Error(retryData.message || 'Помилка запиту')
        }
        
        return retryData
      }
    }

    const data = await response.json().catch(() => ({ message: 'Invalid response format' }))
    
    if (!response.ok) {
      throw new Error(data.message || 'Помилка запиту')
    }

    return data
  }
}