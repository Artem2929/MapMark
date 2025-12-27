const express = require('express')
const { photosController, upload } = require('../controllers/photosController')
const { protect } = require('../middleware/auth')
const { validatePhotoUpload, validatePhotoUpdate, validatePhotoId } = require('../middleware/photoValidation')

const router = express.Router()

// Публічні маршрути
router.get('/users/:userId', photosController.getUserPhotos)
router.get('/:photoId', validatePhotoId, photosController.getPhoto)

// Захищені маршрути
router.use(protect)

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

router.post('/:photoId/like',
  validatePhotoId,
  photosController.togglePhotoLike
)

module.exports = router