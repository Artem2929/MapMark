const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'

const getCsrfToken = () => {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
         localStorage.getItem('csrfToken')
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
    const allowedHosts = ['localhost', '127.0.0.1', process.env.REACT_APP_API_HOST].filter(Boolean)
    
    if (!allowedHosts.includes(parsedUrl.hostname)) {
      throw new Error('Недозволений хост')
    }
    
    return url
  } catch (error) {
    throw new Error('Некоректний URL')
  }
}

export const getUserProfile = async (userId) => {
  try {
    const token = validateToken(localStorage.getItem('token'))
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
    const token = validateToken(localStorage.getItem('token'))
    const csrfToken = getCsrfToken()
    
    if (!csrfToken) {
      throw new Error('CSRF токен відсутній')
    }

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
    const token = validateToken(localStorage.getItem('token'))
    const csrfToken = getCsrfToken()
    
    if (!csrfToken) {
      throw new Error('CSRF токен відсутній')
    }

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
    const token = validateToken(localStorage.getItem('token'))
    const csrfToken = getCsrfToken()
    
    if (!csrfToken) {
      throw new Error('CSRF токен відсутній')
    }

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