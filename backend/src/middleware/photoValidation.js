const { body, validationResult } = require('express-validator')

const validatePhotoUpload = [
  (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Файли не знайдено',
      })
    }

    // Перевіряємо кількість файлів
    if (req.files.length > 10) {
      return res.status(400).json({
        status: 'fail',
        message: 'Максимум 10 фотографій за раз',
      })
    }

    // Перевіряємо тип файлів
    const invalidFiles = req.files.filter(file => !file.mimetype.startsWith('image/'))
    if (invalidFiles.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Тільки зображення дозволені',
      })
    }

    // Перевіряємо розмір файлів
    const oversizedFiles = req.files.filter(file => file.size > 10 * 1024 * 1024) // 10MB
    if (oversizedFiles.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Максимальний розмір файлу 10MB',
      })
    }

    next()
  },
]

const validatePhotoUpdate = [
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Опис не може бути довшим за 500 символів')
    .trim(),
  
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Максимум 10 тегів'),
  
  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Тег повинен бути від 1 до 50 символів')
    .trim(),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic повинно бути boolean'),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Помилки валідації',
        errors: errors.array(),
      })
    }
    next()
  },
]

module.exports = {
  validatePhotoUpload,
  validatePhotoUpdate,
}