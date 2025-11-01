const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// Отримати всі сервіси
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error fetching all services:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при завантаженні сервісів'
    });
  }
});

// Отримати всі сервіси користувача
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const services = await Service.find({ userId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при завантаженні сервісів'
    });
  }
});

// Створити новий сервіс
router.post('/', async (req, res) => {
  try {
    const { title, description, category, userId, photo, price } = req.body;
    
    // Валідація
    if (!title || !description || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Назва, опис та userId є обов\'язковими'
      });
    }
    
    const service = new Service({
      title,
      description,
      category: category || 'service',
      userId,
      photo: photo || null,
      price: price ? Number(price) : null
    });
    
    await service.save();
    
    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при створенні сервісу'
    });
  }
});

// Оновити сервіс
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, price } = req.body;
    
    const service = await Service.findByIdAndUpdate(
      id,
      { 
        title, 
        description, 
        category, 
        price: price ? Number(price) : null,
        updatedAt: Date.now() 
      },
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Сервіс не знайдено'
      });
    }
    
    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при оновленні сервісу'
    });
  }
});

// Видалити сервіс
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await Service.findByIdAndDelete(id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Сервіс не знайдено'
      });
    }
    
    res.json({
      success: true,
      message: 'Сервіс успішно видалено'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при видаленні сервісу'
    });
  }
});

module.exports = router;