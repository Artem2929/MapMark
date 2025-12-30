const userService = require('../services/userService')
const { catchAsync } = require('../utils/errorHandler')
const { success } = require('../utils/response')
const logger = require('../utils/logger')

const getUserProfile = catchAsync(async (req, res, next) => {
  const { userId } = req.params
  const currentUserId = req.user?.id // ID автентифікованого користувача
  const user = await userService.getUserById(userId, currentUserId)
  
  success(res, { user }, 'Профіль користувача отримано успішно')
})

const updateProfile = catchAsync(async (req, res, next) => {
  const { userId } = req.params
  const updateData = req.body
  
  logger.info('Profile update attempt', {
    requestUserId: userId,
    authenticatedUserId: req.user.id,
    authenticatedUserData: req.user
  })
  
  // Ensure user can only update their own profile
  if (req.user.id !== userId) {
    return res.status(403).json({
      status: 'fail',
      message: 'Ви можете редагувати тільки свій профіль'
    })
  }
  
  const updatedUser = await userService.updateProfile(userId, updateData)
  
  logger.info('Profile updated successfully', {
    userId: updatedUser._id,
    updatedFields: Object.keys(updateData)
  })
  
  success(res, { user: updatedUser }, 'Профіль оновлено успішно')
})

const uploadAvatar = catchAsync(async (req, res, next) => {
  const userId = req.user.id
  
  if (!req.file) {
    return res.status(400).json({
      status: 'fail',
      message: 'Файл аватара не знайдено'
    })
  }
  
  const updatedUser = await userService.uploadAvatar(userId, req.file)
  
  logger.info('Avatar uploaded successfully', {
    userId: updatedUser._id,
    fileName: req.file.filename,
    fileSize: req.file.size
  })
  
  success(res, { user: updatedUser }, 'Аватар оновлено успішно')
})

const searchUsers = catchAsync(async (req, res, next) => {
  const { query, country, city, ageRange, limit = 20, random } = req.query
  const currentUserId = req.user.id // Використовуємо ID автентифікованого користувача
  
  const users = await userService.searchUsers({
    query,
    currentUserId,
    country,
    city,
    ageRange,
    limit: parseInt(limit),
    random: random === 'true'
  })
  
  success(res, { data: users }, 'Пошук користувачів виконано успішно')
})

module.exports = {
  getUserProfile,
  updateProfile,
  uploadAvatar,
  searchUsers
}