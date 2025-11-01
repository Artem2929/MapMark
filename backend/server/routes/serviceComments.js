const express = require('express');
const router = express.Router();
const ServiceComment = require('../models/ServiceComment');
const Service = require('../models/Service');

// Отримати коментарі сервісу
router.get('/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    const comments = await ServiceComment.find({ serviceId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Error fetching service comments:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при завантаженні коментарів'
    });
  }
});

// Додати коментар
router.post('/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { userId, text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Текст коментаря не може бути порожнім'
      });
    }
    
    const comment = new ServiceComment({ serviceId, userId, text: text.trim() });
    await comment.save();
    
    // Оновлюємо лічильник коментарів
    const commentsCount = await ServiceComment.countDocuments({ serviceId });
    await Service.findByIdAndUpdate(serviceId, { commentsCount });
    
    res.status(201).json({
      success: true,
      data: { comment, commentsCount }
    });
  } catch (error) {
    console.error('Error adding service comment:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при додаванні коментаря'
    });
  }
});

// Видалити коментар
router.delete('/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await ServiceComment.findByIdAndDelete(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Коментар не знайдено'
      });
    }
    
    // Оновлюємо лічильник коментарів
    const commentsCount = await ServiceComment.countDocuments({ serviceId: comment.serviceId });
    await Service.findByIdAndUpdate(comment.serviceId, { commentsCount });
    
    res.json({
      success: true,
      data: { commentsCount }
    });
  } catch (error) {
    console.error('Error deleting service comment:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при видаленні коментаря'
    });
  }
});

module.exports = router;