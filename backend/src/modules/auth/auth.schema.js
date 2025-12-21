const { body } = require('express-validator');

const loginSchema = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введіть коректний email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль має містити мінімум 6 символів')
];

const registerSchema = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введіть коректний email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль має містити мінімум 6 символів'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Ім\'я має містити від 2 до 50 символів')
];

module.exports = {
  loginSchema,
  registerSchema
};