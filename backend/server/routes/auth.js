const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Rate limiting для логіну
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 5, // максимум 5 спроб
  message: { success: false, message: 'Too many login attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting для реєстрації
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 година
  max: 10, // максимум 10 реєстрацій на годину
  message: { success: false, message: 'Too many registration attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Валідація для логіну
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// Валідація для реєстрації
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Valid email is required (max 100 characters)'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])?/)
    .withMessage('Password must be 6-128 characters with uppercase, lowercase and number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Zа-яА-ЯіІїЇєЄ'\-\s]+$/)
    .withMessage('Name must be 2-50 characters, letters only')
    .custom((value) => {
      // Перевірка на послідовні пробіли
      if (/\s{2,}/.test(value)) {
        throw new Error('Name cannot contain consecutive spaces');
      }
      // Перевірка на пробіли на початку/кінці
      if (value !== value.trim()) {
        throw new Error('Name cannot start or end with spaces');
      }
      return true;
    })
];

// POST /api/auth/login
router.post('/login', loginLimiter, loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Знайти користувача
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Перевірити пароль
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Оновити lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Згенерувати токен
    const token = generateToken(user._id);

    // Set httpOnly cookie for security
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// POST /api/auth/register
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, name, country, role } = req.body;

    // Додаткові перевірки безпеки
    if (!email || !password || !name || !country) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Перевірити чи користувач вже існує
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Перевірка на підозрілі паттерни в імені
    const suspiciousPatterns = /^(admin|root|test|user|null|undefined)$/i;
    if (suspiciousPatterns.test(name.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid name format'
      });
    }

    // Створити нового користувача
    const user = new User({ 
      email, 
      password, 
      name, 
      country,
      role: role || 'user'
    });
    await user.save();

    // Згенерувати токен
    const token = generateToken(user._id);

    // Set httpOnly cookie for security
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          country: user.country,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Обробка помилки дублікату email (якщо індекс не спрацював)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Перевірити чи користувач існує
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      // З міркувань безпеки повертаємо успіх навіть якщо користувач не знайдений
      return res.json({
        success: true,
        message: 'If this email exists, password reset instructions have been sent'
      });
    }

    // В реальному додатку тут би генерувався токен і відправлявся email
    // Поки що просто повертаємо успіх
    res.json({
      success: true,
      message: 'Password reset instructions have been sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  try {
    // Clear httpOnly cookie
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;