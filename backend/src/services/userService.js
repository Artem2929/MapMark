const User = require('../models/User')
const AppError = require('../utils/errorHandler').AppError

const getUserById = async (userId) => {
  // Перш пробуємо знайти за кастомним id, потім за MongoDB _id
  let user = await User.findOne({ id: userId }).select('-password -refreshToken')
  
  if (!user && userId.match(/^[0-9a-fA-F]{24}$/)) {
    // Якщо не знайшли за кастомним id і userId схожий на ObjectId
    user = await User.findById(userId).select('-password -refreshToken')
  }
  
  if (!user) {
    throw new AppError('Користувача не знайдено', 404)
  }
  
  return user
}

const updateProfile = async (userId, updateData) => {
  // Validate allowed fields
  const allowedFields = ['name', 'surname', 'bio', 'location', 'website']
  const filteredData = {}
  
  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredData[key] = updateData[key]
    }
  })
  
  // Перш пробуємо оновити за кастомним id
  let user = await User.findOneAndUpdate(
    { id: userId },
    filteredData,
    { new: true, runValidators: true }
  ).select('-password -refreshToken')
  
  if (!user && userId.match(/^[0-9a-fA-F]{24}$/)) {
    // Якщо не знайшли за кастомним id і userId схожий на ObjectId
    user = await User.findByIdAndUpdate(
      userId,
      filteredData,
      { new: true, runValidators: true }
    ).select('-password -refreshToken')
  }
  
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
    
    // Перш пробуємо оновити за кастомним id
    let user = await User.findOneAndUpdate(
      { id: userId },
      { avatar: avatarData },
      { new: true, runValidators: true }
    ).select('-password -refreshToken')
    
    if (!user && userId.match(/^[0-9a-fA-F]{24}$/)) {
      // Якщо не знайшли за кастомним id і userId схожий на ObjectId
      user = await User.findByIdAndUpdate(
        userId,
        { avatar: avatarData },
        { new: true, runValidators: true }
      ).select('-password -refreshToken')
    }
    
    if (!user) {
      throw new AppError('Користувача не знайдено', 404)
    }
    
    return user
  } catch (error) {
    throw error
  }
}

const searchUsers = async ({ query, currentUserId, country, city, ageRange }) => {
  const searchCriteria = {}
  
  // Виключаємо поточного користувача
  if (currentUserId) {
    searchCriteria.id = { $ne: currentUserId }
  }
  
  // Пошук за ім'ям або email
  if (query) {
    searchCriteria.$or = [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]
  }
  
  // Фільтр за країною
  if (country) {
    searchCriteria.country = country
  }
  
  const users = await User.find(searchCriteria)
    .select('id name email country avatar createdAt')
    .limit(20)
    .sort({ createdAt: -1 })
  
  return users
}

module.exports = {
  getUserById,
  updateProfile,
  uploadAvatar,
  searchUsers
}