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

// Отримати сервіси по serviceItemId
router.get('/item/:serviceItemId', async (req, res) => {
  try {
    const { serviceItemId } = req.params;
    
    const services = await Service.find({ serviceItemId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error fetching services by serviceItemId:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при завантаженні сервісів'
    });
  }
});

// Отримати всі сервіси користувача (тільки основні service-items)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const services = await Service.find({ 
      userId, 
      serviceItemId: { $exists: false } 
    }).sort({ createdAt: -1 });
    
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
    const { title, description, category, userId, photo, price, serviceItemId } = req.body;
    
    // Валідація
    if (!title || !description || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Назва, опис та userId є обов\'язковими'
      });
    }
    
    if (title.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Назва не може перевищувати 50 символів'
      });
    }
    
    if (description.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Опис не може перевищувати 200 символів'
      });
    }
    
    const service = new Service({
      title,
      description,
      category: category || 'service',
      userId,
      photo: photo || null,
      price: price ? Number(price) : null,
      serviceItemId: serviceItemId || null
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
    
    if (title && title.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Назва не може перевищувати 50 символів'
      });
    }
    
    if (description && description.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Опис не може перевищувати 200 символів'
      });
    }
    
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