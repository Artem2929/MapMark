const User = require('../models/User')
const Post = require('../models/Post')
const Follow = require('../models/Follow')
const AppError = require('../utils/errorHandler').AppError

const getUserById = async (userId, currentUserId = null) => {
  // Перш пробуємо знайти за кастомним id, потім за MongoDB _id
  let user = await User.findOne({ id: userId }).select('-password -refreshToken')
  
  if (!user && userId.match(/^[0-9a-fA-F]{24}$/)) {
    // Якщо не знайшли за кастомним id і userId схожий на ObjectId
    user = await User.findById(userId).select('-password -refreshToken')
  }
  
  if (!user) {
    throw new AppError('Користувача не знайдено', 404)
  }
  
  // Get user stats
  const Friend = require('../models/Friend')
  const userObjectId = user._id
  const [postsCount, followingCount, followersCount] = await Promise.all([
    Post.countDocuments({ author: userObjectId }),
    // Підписки - всі на кого я підписаний (відправив заявку)
    Friend.countDocuments({ requester: userObjectId }),
    // Підписники - всі хто на мене підписаний (відправив мені заявку)
    Friend.countDocuments({ recipient: userObjectId })
  ])
  
  const userResult = {
    ...user.toObject(),
    postsCount,
    followersCount,
    followingCount,
    isOnline: user.isOnline
  }
  
  // Додаємо статус підписки, якщо є currentUserId
  if (currentUserId && currentUserId !== userId) {
    const currentUser = await User.findOne({ id: currentUserId })
    if (currentUser) {
      const outgoingRequest = await Friend.findOne({
        requester: currentUser._id,
        recipient: user._id
      })
      const incomingRequest = await Friend.findOne({
        recipient: currentUser._id,
        requester: user._id
      })
      
      let relationshipStatus = 'none'
      if (outgoingRequest && incomingRequest) {
        relationshipStatus = 'friends'
      } else if (outgoingRequest) {
        relationshipStatus = 'following'
      } else if (incomingRequest) {
        relationshipStatus = 'follower'
      }
      
      userResult.relationshipStatus = relationshipStatus
      userResult.isFollowing = relationshipStatus === 'following' || relationshipStatus === 'friends'
    }
  }
  
  return userResult
}

const updateProfile = async (userId, updateData) => {
  // Validate allowed fields
  const allowedFields = ['name', 'surname', 'birthDate', 'email', 'position', 'bio', 'location', 'website', 'visibility']
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

const searchUsers = async ({ query, currentUserId, country, city, ageRange, limit = 20, random = false }) => {
    const Friend = require('../models/Friend')
    
    const searchCriteria = {}
    
    // Виключаємо поточного користувача
    if (currentUserId) {
      searchCriteria.id = { $ne: currentUserId }
    }
    
    // Пошук за ім'ям або email (тільки якщо є query)
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
    
    let usersQuery = User.find(searchCriteria)
      .select('id name email country avatar createdAt')
      .limit(limit)
    
    // Якщо потрібні рандомні користувачі
    if (random) {
      // Використовуємо MongoDB aggregation для рандомної вибірки
      const users = await User.aggregate([
        { $match: searchCriteria },
        { $sample: { size: limit } },
        { $project: { id: 1, name: 1, email: 1, country: 1, avatar: 1, createdAt: 1 } }
      ])
      
      // Додаємо інформацію про статус відносин
      if (currentUserId && users.length > 0) {
        return await addRelationshipStatus(users, currentUserId)
      }
      
      return users
    } else {
      const users = await usersQuery.sort({ createdAt: -1 })
      
      // Додаємо інформацію про статус відносин
      if (currentUserId && users.length > 0) {
        return await addRelationshipStatus(users, currentUserId)
      }
      
      return users
    }
  }

// Допоміжна функція для додавання статусу відносин
const addRelationshipStatus = async (users, currentUserId) => {
  const Friend = require('../models/Friend')
  
  const currentUser = await User.findOne({ id: currentUserId })
  if (!currentUser) return users
  
  // Перевіряємо існуючі відносини
  const friendships = await Friend.find({
    $or: [
      { requester: currentUser._id, recipient: { $in: users.map(u => u._id) } },
      { recipient: currentUser._id, requester: { $in: users.map(u => u._id) } }
    ]
  }).populate('requester recipient', 'id')
  
  // Додаємо статус до кожного користувача
  return users.map(user => {
    const outgoingRequest = friendships.find(f => 
      f.requester.id === currentUserId && f.recipient.id === user.id
    )
    const incomingRequest = friendships.find(f => 
      f.recipient.id === currentUserId && f.requester.id === user.id
    )
    
    let relationshipStatus = 'none'
    
    if (outgoingRequest && incomingRequest) {
      relationshipStatus = 'friends'
    } else if (outgoingRequest) {
      relationshipStatus = 'following'
    } else if (incomingRequest) {
      relationshipStatus = 'follower'
    }
    
    return {
      ...user,
      relationshipStatus,
      requestSent: !!outgoingRequest,
      requestReceived: !!incomingRequest,
      isFriend: relationshipStatus === 'friends'
    }
  })
}

module.exports = {
  getUserById,
  updateProfile,
  uploadAvatar,
  searchUsers
}