const multer = require('multer')
const AppError = require('../utils/errorHandler').AppError

// Configure multer for memory storage (Base64)
const memoryStorage = multer.memoryStorage()

// File filter for images only
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new AppError('Тільки зображення дозволені для завантаження', 400), false)
  }
}

// Configure multer for avatars
const uploadAvatarMulter = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
})

// Configure multer for post images
const uploadPostImagesMulter = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 4 // Max 4 images
  }
})

// Middleware wrapper
const uploadAvatar = (req, res, next) => {
  const upload = uploadAvatarMulter.single('avatar')
  
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('Файл занадто великий. Максимальний розмір: 5MB', 400))
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return next(new AppError('Можна завантажити тільки один файл', 400))
      }
      return next(new AppError('Помилка завантаження файлу', 400))
    }
    
    if (err) {
      return next(err)
    }
    
    next()
  })
}

module.exports = {
  uploadAvatar,
  upload: uploadPostImagesMulter
}