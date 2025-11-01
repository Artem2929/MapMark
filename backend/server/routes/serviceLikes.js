const express = require('express');
const router = express.Router();
const ServiceLike = require('../models/ServiceLike');
const Service = require('../models/Service');

// Лайк/дізлайк сервісу
router.post('/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { userId, type } = req.body;
    
    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Невірний тип реакції'
      });
    }
    
    // Видаляємо попередню реакцію користувача
    await ServiceLike.findOneAndDelete({ serviceId, userId });
    
    // Додаємо нову реакцію
    const serviceLike = new ServiceLike({ serviceId, userId, type });
    await serviceLike.save();
    
    // Оновлюємо лічильники
    const likesCount = await ServiceLike.countDocuments({ serviceId, type: 'like' });
    const dislikesCount = await ServiceLike.countDocuments({ serviceId, type: 'dislike' });
    
    await Service.findByIdAndUpdate(serviceId, { likesCount, dislikesCount });
    
    res.json({
      success: true,
      data: { likesCount, dislikesCount }
    });
  } catch (error) {
    console.error('Error handling service like:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при обробці реакції'
    });
  }
});

// Видалити реакцію
router.delete('/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { userId } = req.body;
    
    await ServiceLike.findOneAndDelete({ serviceId, userId });
    
    // Оновлюємо лічильники
    const likesCount = await ServiceLike.countDocuments({ serviceId, type: 'like' });
    const dislikesCount = await ServiceLike.countDocuments({ serviceId, type: 'dislike' });
    
    await Service.findByIdAndUpdate(serviceId, { likesCount, dislikesCount });
    
    res.json({
      success: true,
      data: { likesCount, dislikesCount }
    });
  } catch (error) {
    console.error('Error removing service like:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при видаленні реакції'
    });
  }
});

module.exports = router;