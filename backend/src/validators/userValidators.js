const { body, validationResult } = require('express-validator')

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      message: 'Помилка валідації',
      errors: errors.array()
    })
  }
  next()
}

const userValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Ім\'я повинно містити від 2 до 50 символів')
    .matches(/^[a-zA-Zа-яА-ЯіІїЇєЄ\s'-]+$/)
    .withMessage('Ім\'я може містити тільки літери, пробіли, апострофи та дефіси'),
  
  body('surname')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Прізвище не може перевищувати 50 символів'),
  
  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('Некоректна дата')
    .custom((value) => {
      if (value) {
        const date = new Date(value)
        const today = new Date()
        const age = today.getFullYear() - date.getFullYear()
        if (age < 13 || age > 120) {
          throw new Error('Вік повинен бути від 13 до 120 років')
        }
      }
      return true
    }),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Введіть коректний email')
    .isLength({ max: 50 })
    .withMessage('Email не може перевищувати 50 символів'),
  
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Посада не може перевищувати 100 символів'),
    
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Біографія не може перевищувати 500 символів'),
    
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Місцезнаходження не може перевищувати 100 символів'),
    
  body('website')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Веб-сайт не може перевищувати 100 символів')
    .custom((value) => {
      if (value && !value.match(/^https?:\/\/.+/)) {
        throw new Error('Веб-сайт повинен починатися з http:// або https://')
      }
      return true
    })
]

module.exports = {
  userValidation,
  handleValidationErrors
}