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

export const updateProfile = async (userId, profileData) => {
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
}