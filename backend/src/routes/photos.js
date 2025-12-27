const express = require('express')
const { photosController, upload } = require('../controllers/photosController')
const { authenticateToken } = require('../middleware/auth')
const { validatePhotoUpload, validatePhotoUpdate, validatePhotoId } = require('../middleware/photoValidation')

const router = express.Router()

// Публічні маршрути
router.get('/users/:userId/photos', photosController.getUserPhotos)
router.get('/:photoId', validatePhotoId, photosController.getPhoto)

// Захищені маршрути
router.use(authenticateToken)

router.post('/upload', 
  upload.array('photos', 10),
  validatePhotoUpload,
  photosController.uploadPhotos
)

router.put('/:photoId', 
  validatePhotoUpdate,
  photosController.updatePhoto
)

router.delete('/:photoId', 
  validatePhotoId,
  photosController.deletePhoto
)

module.exports = router