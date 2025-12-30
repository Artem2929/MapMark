const { body, validationResult } = require('express-validator')
const { AppError } = require('../utils/errorHandler')

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join('. ')
    return next(new AppError(errorMessages, 400, 'VALIDATION_ERROR'))
  }
  next()
}

// Auth validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Zа-яА-ЯіІїЇєЄ'\-\s]+$/)
    .withMessage('Ім\'я може містити тільки літери, пробіли, дефіси та апострофи')
    .custom((value) => {
      // Check for consecutive spaces
      if (/\s{2,}/.test(value)) {
        throw new Error('Name cannot contain consecutive spaces')
      }
      // Check for leading/trailing spaces
      if (value !== value.trim()) {
        throw new Error('Name cannot start or end with spaces')
      }
      // Check for suspicious patterns
      const suspiciousPatterns = /^(admin|root|test|user|null|undefined)$/i
      if (suspiciousPatterns.test(value.trim())) {
        throw new Error('Invalid name format')
      }
      return true
    }),
    
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters'),
    
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match')
      }
      return true
    }),
    
  body('country')
    .isIn(['UA'])
    .withMessage('Country must be UA (Ukraine)'),
    
  body('role')
    .optional()
    .isIn(['user', 'seller'])
    .withMessage('Role must be either user or seller'),
    
  handleValidationErrors
]

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
    
  handleValidationErrors
]

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match')
      }
      return true
    }),
    
  handleValidationErrors
]

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Zа-яА-ЯіІїЇєЄ'\-\s]+$/)
    .withMessage('Ім\'я може містити тільки літери, пробіли, дефіси та апострофи'),
    
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
    
  handleValidationErrors
]

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
    
  handleValidationErrors
]

module.exports = {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  updateProfileValidation,
  forgotPasswordValidation,
  handleValidationErrors
}