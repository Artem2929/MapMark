const User = require('../models/User')

const updateActivity = async (req, res, next) => {
  if (req.user?.id) {
    try {
      await User.findOneAndUpdate(
        { id: req.user.id },
        { lastActivity: new Date() },
        { new: false }
      )
    } catch (err) {
      // Silent fail - не блокуємо запит якщо не вдалось оновити активність
    }
  }
  next()
}

module.exports = updateActivity
