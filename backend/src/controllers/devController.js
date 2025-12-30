const User = require('../models/User')
const { catchAsync } = require('../utils/errorHandler')
const { success } = require('../utils/response')
const logger = require('../utils/logger')

const clearTestUsers = catchAsync(async (req, res, next) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      status: 'error',
      message: 'Not allowed in production'
    })
  }

  // Delete all users (be careful!)
  const result = await User.deleteMany({})
  
  logger.info('Test users cleared', {
    deletedCount: result.deletedCount
  })
  
  success(res, { deletedCount: result.deletedCount }, 'Test users cleared successfully')
})

module.exports = {
  clearTestUsers
}