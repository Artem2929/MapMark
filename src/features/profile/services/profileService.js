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

export const updateProfile = async (userId, profileData) => {
  try {
    const token = validateToken(localStorage.getItem('token'))
    const csrfToken = getCsrfToken()
    
    if (!csrfToken) {
      throw new Error('CSRF токен відсутній')
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify(profileData)
    })

    if (!response.ok) {
      throw new Error('Не вдалося оновити профіль')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Profile update error:', error)
    throw error
  }
}