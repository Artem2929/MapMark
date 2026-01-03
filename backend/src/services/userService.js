const userRepository = require('../repositories/userRepository')
const Post = require('../models/Post')
const Friend = require('../models/Friend')
const { AppError } = require('../utils/errorHandler')
const { mapUserToResponse } = require('../mappers/userMapper')

const getUserById = async (userId, currentUserId = null) => {
  const user = await userRepository.findByIdOrCustomId(userId)
  
  if (!user) {
    throw new AppError('Користувача не знайдено', 404)
  }
  
  // Get user stats
  const userObjectId = user._id
  const [postsCount, followingCount, followersCount] = await Promise.all([
    Post.countDocuments({ author: userObjectId }),
    Friend.countDocuments({ requester: userObjectId }),
    Friend.countDocuments({ recipient: userObjectId })
  ])
  
  const userResult = mapUserToResponse(user, {
    postsCount,
    followersCount,
    followingCount
  })
  
  // Додаємо статус підписки, якщо є currentUserId
  if (currentUserId && currentUserId !== userId) {
    const currentUser = await userRepository.findByIdOrCustomId(currentUserId)
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
  const allowedFields = ['name', 'surname', 'birthDate', 'email', 'position', 'bio', 'location', 'website', 'visibility']
  const filteredData = {}
  
  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredData[key] = updateData[key]
    }
  })
  
  const user = await userRepository.updateByIdOrCustomId(userId, filteredData)
  
  if (!user) {
    throw new AppError('Користувача не знайдено', 404)
  }
  
  return user
}

const uploadAvatar = async (userId, file) => {
  const base64Data = file.buffer.toString('base64')
  const avatarData = `data:${file.mimetype};base64,${base64Data}`
  
  const user = await userRepository.updateByIdOrCustomId(userId, { avatar: avatarData })
  
  if (!user) {
    throw new AppError('Користувача не знайдено', 404)
  }
  
  return user
}

const searchUsers = async ({ query, currentUserId, country, city, ageRange, limit = 20, random = false }) => {
  const searchCriteria = {}
  
  if (currentUserId) {
    searchCriteria.id = { $ne: currentUserId }
  }
  
  if (query) {
    searchCriteria.$or = [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]
  }
  
  if (country) {
    searchCriteria.country = country
  }
  
  const users = random 
    ? await userRepository.searchRandom(searchCriteria, limit)
    : await userRepository.search(searchCriteria, limit)
  
  if (currentUserId && users.length > 0) {
    return addRelationshipStatus(users, currentUserId)
  }
  
  return users
}

const addRelationshipStatus = async (users, currentUserId) => {
  const currentUser = await userRepository.findByIdOrCustomId(currentUserId)
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