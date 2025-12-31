const User = require('../models/User')
const Friend = require('../models/Friend')

const blockUser = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user.id

    if (userId === currentUserId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Не можна заблокувати самого себе'
      })
    }

    // Перевіряємо чи існує користувач
    const userToBlock = await User.findById(userId)
    if (!userToBlock) {
      return res.status(404).json({
        status: 'fail',
        message: 'Користувача не знайдено'
      })
    }

    // Перевіряємо чи вже заблокований
    const currentUser = await User.findById(currentUserId)
    if (currentUser.blockedUsers && currentUser.blockedUsers.includes(userId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Користувач вже заблокований'
      })
    }

    // Додаємо до списку заблокованих
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { blockedUsers: userId }
    })

    // Видаляємо з друзів якщо є
    await Friend.deleteMany({
      $or: [
        { user: currentUserId, friend: userId },
        { user: userId, friend: currentUserId }
      ]
    })

    res.status(200).json({
      status: 'success',
      message: 'Користувача заблоковано'
    })

  } catch (error) {
    console.error('Block user error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Помилка сервера'
    })
  }
}

module.exports = { blockUser }