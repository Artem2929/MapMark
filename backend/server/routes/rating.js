const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const auth = require('../middleware/auth');

// Отримати рейтинг користувача
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Підрахунок загального рейтингу
    const ratings = await Rating.find({ userId });
    const totalRating = ratings.reduce((sum, rating) => sum + rating.vote, 0);

    // Перевірка чи поточний користувач вже голосував
    const userVote = await Rating.findOne({ 
      userId, 
      voterId: currentUserId 
    });

    res.json({
      success: true,
      rating: totalRating,
      userVote: userVote ? userVote.vote : 0
    });
  } catch (error) {
    console.error('Error getting rating:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Помилка отримання рейтингу' 
    });
  }
});

// Проголосувати за користувача
router.post('/:userId/vote', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { vote } = req.body;
    const voterId = req.user.id;

    // Перевірка що користувач не голосує за себе
    if (userId === voterId) {
      return res.status(400).json({
        success: false,
        message: 'Не можна голосувати за себе'
      });
    }

    // Перевірка валідності голосу
    if (vote !== 1 && vote !== -1) {
      return res.status(400).json({
        success: false,
        message: 'Невалідний голос'
      });
    }

    // Оновлення або створення голосу
    await Rating.findOneAndUpdate(
      { userId, voterId },
      { vote },
      { upsert: true, new: true }
    );

    // Підрахунок нового рейтингу
    const ratings = await Rating.find({ userId });
    const totalRating = ratings.reduce((sum, rating) => sum + rating.vote, 0);

    res.json({
      success: true,
      rating: totalRating,
      message: 'Голос збережено'
    });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Помилка голосування' 
    });
  }
});

module.exports = router;