const { body, validationResult, param } = require('express-validator')
const rateLimit = require('express-rate-limit')

// Rate limiting для завантаження
const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 5, // максимум 5 завантажень за 15 хвилин
  message: {
    status: 'error',
    message: 'Забагато спроб завантаження. Спробуйте пізніше.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

const validatePhotoUpload = [
  uploadRateLimit,
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
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const invalidFiles = req.files.filter(file => !allowedMimeTypes.includes(file.mimetype))
    if (invalidFiles.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Дозволені тільки JPEG, PNG, WebP та GIF зображення',
      })
    }

    // Перевіряємо розмір файлів (10MB)
    const maxSize = 10 * 1024 * 1024
    const oversizedFiles = req.files.filter(file => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Максимальний розмір файлу 10MB',
      })
    }

    // Перевіряємо загальний розмір всіх файлів (50MB)
    const totalSize = req.files.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > 50 * 1024 * 1024) {
      return res.status(400).json({
        status: 'fail',
        message: 'Загальний розмір файлів не може перевищувати 50MB',
      })
    }

    next()
  },
]

const validatePhotoUpdate = [
  param('photoId')
    .isMongoId()
    .withMessage('Невірний ID фотографії'),
    
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Опис не може бути довшим за 500 символів')
    .trim()
    .escape(), // Захист від XSS
  
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Максимум 10 тегів'),
  
  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Тег повинен бути від 1 до 50 символів')
    .trim()
    .escape(),
  
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

const validatePhotoId = [
  param('photoId')
    .isMongoId()
    .withMessage('Невірний ID фотографії'),
    
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Невірний ID фотографії',
      })
    }
    next()
  },
]

module.exports = {
  validatePhotoUpload,
  validatePhotoUpdate,
  validatePhotoId,
}