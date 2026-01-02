const mongoose = require('mongoose')
const config = require('../config')
const logger = require('../utils/logger')

const addLastActivityToUsers = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI)
    logger.info('Connected to MongoDB for migration')

    const User = require('../models/User')
    
    const result = await User.updateMany(
      { lastActivity: { $exists: false } },
      { $set: { lastActivity: new Date() } }
    )

    logger.info('Migration completed', {
      matched: result.matchedCount,
      modified: result.modifiedCount
    })

    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    logger.error('Migration failed', { error: error.message })
    process.exit(1)
  }
}

addLastActivityToUsers()
