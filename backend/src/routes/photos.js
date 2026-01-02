const express = require('express')
const { photosController, upload } = require('../controllers/photosController')
const { protect } = require('../middleware/auth')
const { validatePhotoUpload, validatePhotoUpdate, validatePhotoId } = require('../middleware/photoValidation')
const { uploadLimiter } = require('../middleware/security')

const router = express.Router()

// Публічні маршрути
router.get('/users/:userId', photosController.getUserPhotos)
router.get('/:photoId', validatePhotoId, photosController.getPhoto)

// Захищені маршрути
router.use(protect)

router.post('/upload', 
  uploadLimiter,
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

router.get('/:photoId/comments',
  validatePhotoId,
  photosController.getPhotoComments
)

router.post('/:photoId/comments',
  validatePhotoId,
  photosController.addPhotoComment
)

router.put('/:photoId/comments/:commentId',
  validatePhotoId,
  photosController.updatePhotoComment
)

router.delete('/:photoId/comments/:commentId',
  validatePhotoId,
  photosController.deletePhotoComment
)

router.post('/:photoId/comments/:commentId/like',
  validatePhotoId,
  photosController.toggleCommentLike
)

module.exports = router