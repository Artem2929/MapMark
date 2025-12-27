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