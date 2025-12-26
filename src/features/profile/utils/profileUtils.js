export const getInitialFormData = (user) => {
  const nameParts = user?.name?.split(' ') || []
  return {
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    gender: user?.gender || 'чоловіча',
    birthDate: user?.birthDate || '',
    birthCity: user?.city || '',
    about: user?.bio || ''
  }
}

export const showNotification = (message, type = 'error') => {
  // TODO: Replace with proper notification system
  console.warn(`${type.toUpperCase()}: ${message}`)
}

export const validateFileUpload = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Підтримуються лише зображення JPG, PNG або WEBP')
  }

  if (file.size > maxSize) {
    throw new Error('Фото занадто велике. Максимальний розмір: 5MB')
  }

  return true
}

export const getUserId = (user) => user?._id || user?.id