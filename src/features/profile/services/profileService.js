const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'

const getCsrfToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/csrf-token`, {
      credentials: 'include'
    })
    const data = await response.json()
    return data.csrfToken
  } catch (error) {
    throw new Error('Не вдалося отримати CSRF токен')
  }
}

const getAuthToken = () => {
  return localStorage.getItem('accessToken') || localStorage.getItem('token')
}

const validateToken = (token) => {
  if (!token) {
    throw new Error('Токен автентифікації відсутній')
  }
  return token
}

const validateUrl = (url) => {
  try {
    const parsedUrl = new URL(url)
    const allowedHosts = ['localhost', '127.0.0.1']
    const allowedPorts = ['3001', '5173']
    
    // Перевіряємо чи хост дозволений
    if (!allowedHosts.includes(parsedUrl.hostname)) {
      throw new Error('Недозволений хост')
    }
    
    // Перевіряємо чи порт дозволений (якщо вказаний)
    if (parsedUrl.port && !allowedPorts.includes(parsedUrl.port)) {
      throw new Error('Недозволений порт')
    }
    
    // Перевіряємо протокол
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Недозволений протокол')
    }
    
    return url
  } catch (error) {
    throw new Error('Некоректний URL')
  }
}

export const getUserProfile = async (userId) => {
  try {
    const token = validateToken(getAuthToken())
    const url = validateUrl(`${API_BASE_URL}/api/v1/users/${userId}`)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Користувача не знайдено')
      }
      throw new Error('Помилка завантаження профілю')
    }

    return await response.json()
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('Помилка мережі. Перевірте підключення до інтернету')
    }
    throw error
  }
}

export const createPost = async (content) => {
  try {
    const token = validateToken(getAuthToken())
    const csrfToken = await getCsrfToken()
    
    const url = validateUrl(`${API_BASE_URL}/api/v1/posts`)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      throw new Error('Помилка створення посту')
    }

    return await response.json()
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('Помилка мережі. Перевірте підключення до інтернету')
    }
    throw error
  }
}

export const uploadAvatar = async (formData) => {
  try {
    const token = validateToken(getAuthToken())
    const csrfToken = await getCsrfToken()

    const url = validateUrl(`${API_BASE_URL}/api/v1/users/avatar`)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-CSRF-Token': csrfToken
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Помилка завантаження аватара')
    }

    return await response.json()
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('Помилка мережі. Перевірте підключення до інтернету')
    }
    throw error
  }
}

export const updateProfile = async (userId, profileData) => {
  try {
    const token = validateToken(getAuthToken())
    const csrfToken = await getCsrfToken()

    const url = validateUrl(`${API_BASE_URL}/api/v1/users/${userId}`)
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify(profileData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Не вдалося оновити профіль')
    }

    return await response.json()
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('Помилка мережі. Перевірте підключення до інтернету')
    }
    throw error
  }
}