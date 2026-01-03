const User = require('../models/User')

class UserRepository {
  async findByEmail(email) {
    return User.findOne({ email, isActive: true })
  }

  async findByEmailWithPassword(email) {
    return User.findOne({ email, isActive: true }).select('+password')
  }

  async findByIdOrCustomId(userId) {
    let user = await User.findOne({ id: userId }).select('-password -refreshToken')
    
    if (!user && userId.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(userId).select('-password -refreshToken')
    }
    
    return user
  }

  async findById(userId) {
    // Спочатку шукаємо по полю id (CUID)
    let user = await User.findOne({ id: userId })
    
    // Якщо не знайдено і це схоже на ObjectId, шукаємо по _id
    if (!user && userId.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(userId)
    }
    
    return user
  }

  async create(userData) {
    return User.create(userData)
  }

  async countDocuments(query = {}) {
    return User.countDocuments(query)
  }

  async updateByIdOrCustomId(userId, updateData, options = {}) {
    let user = await User.findOneAndUpdate(
      { id: userId },
      updateData,
      { new: true, runValidators: true, ...options }
    ).select('-password -refreshToken')
    
    if (!user && userId.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true, ...options }
      ).select('-password -refreshToken')
    }
    
    return user
  }

  async search(criteria, limit = 20, sort = { createdAt: -1 }) {
    return User.find(criteria)
      .select('id name email country avatar createdAt')
      .limit(limit)
      .sort(sort)
  }

  async searchRandom(criteria, limit = 20) {
    return User.aggregate([
      { $match: criteria },
      { $sample: { size: limit } },
      { $project: { id: 1, name: 1, email: 1, country: 1, avatar: 1, createdAt: 1 } }
    ])
  }

  async updateLastActivity(userId) {
    return User.findByIdAndUpdate(
      userId,
      { lastActivity: new Date() },
      { new: true, validateBeforeSave: false }
    )
  }
}

module.exports = new UserRepository()
