const express = require('express');
const router = express.Router();
const PointsService = require('../services/PointsService');
const auth = require('../middleware/auth');

// Додати бали за відгук
router.post('/review', auth, async (req, res) => {
  try {
    const { hasPhotos, photoCount } = req.body;
    const userId = req.user.id;
    
    const userPoints = await PointsService.addReviewPoints(userId, hasPhotos, photoCount);
    
    res.json({
      success: true,
      points: userPoints.totalPoints,
      message: 'Бали за відгук нараховано'
    });
  } catch (error) {
    console.error('Error adding review points:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Помилка нарахування балів' 
    });
  }
});

// Додати бали за нове місце
router.post('/place', auth, async (req, res) => {
  try {
    const { isVerified } = req.body;
    const userId = req.user.id;
    
    const userPoints = await PointsService.addPlacePoints(userId, isVerified);
    
    res.json({
      success: true,
      points: userPoints.totalPoints,
      message: 'Бали за додавання місця нараховано'
    });
  } catch (error) {
    console.error('Error adding place points:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Помилка нарахування балів' 
    });
  }
});

// Додати бали за лайки
router.post('/likes', auth, async (req, res) => {
  try {
    const { likeCount } = req.body;
    const userId = req.user.id;
    
    const userPoints = await PointsService.addLikePoints(userId, likeCount);
    
    res.json({
      success: true,
      points: userPoints.totalPoints,
      message: 'Бали за лайки нараховано'
    });
  } catch (error) {
    console.error('Error adding like points:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Помилка нарахування балів' 
    });
  }
});

// Додати штрафні бали
router.post('/penalty', auth, async (req, res) => {
  try {
    const { reason, points } = req.body;
    const userId = req.user.id;
    
    const userPoints = await PointsService.addPenalty(userId, reason, points);
    
    res.json({
      success: true,
      points: userPoints.totalPoints,
      message: 'Штрафні бали нараховано'
    });
  } catch (error) {
    console.error('Error adding penalty:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Помилка нарахування штрафу' 
    });
  }
});

// Отримати детальну інформацію про бали
router.get('/details/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const ratingData = await PointsService.getTotalRating(userId);
    
    res.json({
      success: true,
      data: ratingData
    });
  } catch (error) {
    console.error('Error getting points details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Помилка отримання деталей балів' 
    });
  }
});

module.exports = router;