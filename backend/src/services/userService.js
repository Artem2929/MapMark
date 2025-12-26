const User = require('../models/User')
const AppError = require('../utils/errorHandler').AppError

const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password -refreshToken')
  
  if (!user) {
    throw new AppError('Користувача не знайдено', 404)
  }
  
  return user
}

const updateProfile = async (userId, updateData) => {
  // Validate allowed fields
  const allowedFields = ['name', 'bio', 'location', 'website']
  const filteredData = {}
  
  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredData[key] = updateData[key]
    }
  })
  
  const user = await User.findByIdAndUpdate(
    userId,
    filteredData,
    { new: true, runValidators: true }
  ).select('-password -refreshToken')
  
  if (!user) {
    throw new AppError('Користувача не знайдено', 404)
  }
  
  return user
}

const uploadAvatar = async (userId, file) => {
  try {
    // Convert file buffer to Base64
    const base64Data = file.buffer.toString('base64')
    const avatarData = `data:${file.mimetype};base64,${base64Data}`
    
    // Update user with new avatar
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarData },
      { new: true, runValidators: true }
    ).select('-password -refreshToken')
    
    if (!user) {
      throw new AppError('Користувача не знайдено', 404)
    }
    
    return user
  } catch (error) {
    throw error
  }
}

module.exports = {
  getUserById,
  updateProfile,
  uploadAvatar
}