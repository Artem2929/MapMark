const blockUser = async (userId) => {
  try {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      return { success: false, error: 'Не авторизований' }
    }

    const response = await fetch(`http://localhost:3001/api/v1/users/block/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    if (response.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.message || 'Помилка блокування користувача' }
    }
  } catch (error) {
    return { success: false, error: 'Помилка мережі' }
  }
}

export { blockUser }