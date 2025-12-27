const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL environment variable is required')
}

let csrfToken = null

const getCSRFToken = async (forceRefresh = false) => {
  if (!csrfToken || forceRefresh) {
    const response = await fetch(`${API_BASE_URL}/auth/csrf-token`, {
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('Не вдалося отримати CSRF токен')
    }
    
    const data = await response.json()
    csrfToken = data.csrfToken
  }
  return csrfToken
}

export const apiClient = {
  async request(url, options = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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
    const token = await getCSRFToken()
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
        ...options.headers
      },
      credentials: 'include'
    })

    if (response.status === 403) {
      const errorData = await response.clone().json()
      if (errorData.code === 'INVALID_CSRF_TOKEN') {
        const newToken = await getCSRFToken(true)
        
        return fetch(`${API_BASE_URL}${url}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': newToken,
            ...options.headers
          },
          credentials: 'include'
        })
      }
    }

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Помилка запиту')
    }

    return data
  }
}