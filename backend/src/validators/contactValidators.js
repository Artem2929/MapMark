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

const createContactValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Ім\'я є обов\'язковим')
    .isLength({ min: 2, max: 100 })
    .withMessage('Ім\'я повинно містити від 2 до 100 символів')
    .matches(/^[a-zA-Zа-яА-ЯіІїЇєЄ\s'-]+$/)
    .withMessage('Ім\'я може містити тільки літери, пробіли, апострофи та дефіси'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email є обов\'язковим')
    .isEmail()
    .withMessage('Невірний формат email')
    .normalizeEmail(),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Повідомлення є обов\'язковим')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Повідомлення повинно містити від 10 до 1000 символів')
]

module.exports = {
  createContactValidation,
  handleValidationErrors
}