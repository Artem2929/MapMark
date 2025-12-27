const express = require('express')
const { photosController, upload } = require('../controllers/photosController')
const { authenticateToken } = require('../middleware/auth')
const { validatePhotoUpload, validatePhotoUpdate } = require('../middleware/photoValidation')
const rateLimit = require('express-rate-limit')

const router = express.Router()

// Rate limiting для завантаження фотографій
const uploadLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 10, // максимум 10 завантажень за 15 хвилин
  message: {
    status: 'error',
    message: 'Забагато спроб завантаження. Спробуйте пізніше.',
  },
})

// Публічні маршрути
router.get('/users/:userId/photos', photosController.getUserPhotos)
router.get('/:photoId', photosController.getPhoto)

// Захищені маршрути
router.use(authenticateToken)

router.post('/upload', 
  uploadLimit,
  upload.array('photos', 10),
  validatePhotoUpload,
  photosController.uploadPhotos
)

router.put('/:photoId', 
  validatePhotoUpdate,
  photosController.updatePhoto
)

router.delete('/:photoId', photosController.deletePhoto)

module.exports = router