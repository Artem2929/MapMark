const TeamMember = require('../models/TeamMember');
const ContactMessage = require('../models/ContactMessage');
const User = require('../models/User');
const { getReviews } = require('../Repositories/ReviewRepository');

// Get about page statistics
async function getAboutStatsHandler(req, res) {
  try {
    // Disable caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const [users, reviews] = await Promise.all([
      User.countDocuments(),
      getReviews()
    ]);

    // Calculate unique countries from reviews
    const countries = new Set();
    let totalPhotos = 0;

    reviews.forEach(review => {
      if (review.country) countries.add(review.country);
      if (review.photos) totalPhotos += review.photos.length;
    });

    const stats = {
      totalUsers: users,
      totalReviews: reviews.length,
      totalCountries: countries.size,
      totalPhotos: totalPhotos
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching about stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
}

// Get team members
async function getTeamMembersHandler(req, res) {
  try {
    // Disable caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const teamMembers = await TeamMember.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select('-__v');

    res.json({
      success: true,
      data: teamMembers
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team members',
      error: error.message
    });
  }
}

// Submit contact message
async function submitContactMessageHandler(req, res) {
  try {
    const { name, email, message } = req.body;
    const errors = [];

    // Validate name
    if (!name || !name.trim()) {
      errors.push({ field: 'name', message: "Ім'я обов'язкове" });
    } else {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        errors.push({ field: 'name', message: "Ім'я повинно містити мінімум 2 символи" });
      } else if (trimmedName.length > 50) {
        errors.push({ field: 'name', message: "Ім'я не може перевищувати 50 символів" });
      }
    }

    // Validate email
    if (!email || !email.trim()) {
      errors.push({ field: 'email', message: "Email обов'язковий" });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push({ field: 'email', message: 'Введіть коректний email' });
      }
    }

    // Validate message
    if (!message || !message.trim()) {
      errors.push({ field: 'message', message: "Повідомлення обов'язкове" });
    } else {
      const trimmedMessage = message.trim();
      if (trimmedMessage.length < 10) {
        errors.push({ field: 'message', message: 'Повідомлення повинно містити мінімум 10 символів' });
      } else if (trimmedMessage.length > 1000) {
        errors.push({ field: 'message', message: 'Повідомлення не може перевищувати 1000 символів' });
      }
    }

    // Return validation errors
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Помилки валідації',
        errors: errors
      });
    }

    // Check for spam (simple rate limiting)
    const recentMessages = await ContactMessage.countDocuments({
      email: email.trim().toLowerCase(),
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    });

    if (recentMessages >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Забагато повідомлень. Спробуйте пізніше.'
      });
    }

    // Create contact message
    const contactMessage = new ContactMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      ipAddress: req.ip || req.connection.remoteAddress
    });

    await contactMessage.save();

    res.status(201).json({
      success: true,
      message: 'Повідомлення надіслано успішно! Ми зв\'яжемося з вами найближчим часом.',
      data: {
        id: contactMessage._id,
        createdAt: contactMessage.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const mongoErrors = [];
      Object.keys(error.errors).forEach(key => {
        mongoErrors.push({
          field: key,
          message: error.errors[key].message
        });
      });
      
      return res.status(400).json({
        success: false,
        message: 'Помилки валідації',
        errors: mongoErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Помилка відправки повідомлення',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Внутрішня помилка сервера'
    });
  }
}

// Get contact messages (admin only)
async function getContactMessagesHandler(req, res) {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    
    const filter = {};
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('respondedBy', 'name email');

    const total = await ContactMessage.countDocuments(filter);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact messages',
      error: error.message
    });
  }
}

// Mark message as read
async function markMessageAsReadHandler(req, res) {
  try {
    const { messageId } = req.params;

    const message = await ContactMessage.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating message',
      error: error.message
    });
  }
}

module.exports = {
  getAboutStatsHandler,
  getTeamMembersHandler,
  submitContactMessageHandler,
  getContactMessagesHandler,
  markMessageAsReadHandler
};