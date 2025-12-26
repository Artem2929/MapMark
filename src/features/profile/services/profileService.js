const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'

export const updateProfile = async (userId, profileData) => {
  try {
    const token = localStorage.getItem('token')
    
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    })

    if (!response.ok) {
      throw new Error('Failed to update profile')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Profile update error:', error)
    throw error
  }
}