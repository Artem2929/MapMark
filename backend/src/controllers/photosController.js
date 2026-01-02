const Photo = require('../models/Photo')
const PhotoLike = require('../models/PhotoLike')
const PhotoComment = require('../models/PhotoComment')
const User = require('../models/User')
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises
// const sharp = require('sharp')
const crypto = require('crypto')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')

// Налаштування multer з безпечними обмеженнями
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10, // максимум 10 файлів
  },
  fileFilter: (req, file, cb) => {
    // Строга перевірка MIME типів
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Недозволений тип файлу'), false)
    }
  },
})

class PhotosController {
  // Отримати фотографії користувача з пагінацією
  async getUserPhotos(req, res) {
    try {
      const { userId } = req.params
      const { page = 1, limit = 20 } = req.query

      // Валідація параметрів
      const pageNum = Math.max(1, parseInt(page))
      const limitNum = Math.min(50, Math.max(1, parseInt(limit)))

      // Знаходимо користувача за кастомним id
      const user = await User.findOne({ id: userId })
      if (!user) {
        return res.status(404).json({
          status: 'fail',
          message: 'Користувача не знайдено',
        })
      }

      const photos = await Photo.find({ 
        userId: user._id,
        $or: [
          { isPublic: true },
          { userId: req.user?._id } // власні фото завжди видимі
        ]
      })
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .populate('userId', 'name id')
        .select('-__v')

      // Очищаємо відповідь від зайвих полів
      const cleanPhotos = photos.map(photo => {
        const photoObj = photo.toObject()
        if (photoObj.userId) {
          photoObj.userId = photoObj.userId.id // залишаємо тільки кастомний id
        }
        return photoObj
      })

      // Додаємо інформацію про лайки та коментарі
      for (const photo of cleanPhotos) {
        const likes = await PhotoLike.countDocuments({ photoId: photo._id, type: 'like' })
        const dislikes = await PhotoLike.countDocuments({ photoId: photo._id, type: 'dislike' })
        const userLike = req.user ? await PhotoLike.findOne({ photoId: photo._id, userId: req.user._id }) : null
        const commentsCount = await PhotoComment.countDocuments({ photoId: photo._id })
        
        photo.likes = likes
        photo.dislikes = dislikes
        photo.userReaction = userLike?.type || null
        photo.commentsCount = commentsCount
      }

      const total = await Photo.countDocuments({ 
        userId: user._id,
        $or: [
          { isPublic: true },
          { userId: req.user?._id }
        ]
      })

      res.json({
        status: 'success',
        data: {
          photos: cleanPhotos,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        },
      })
    } catch (error) {
      console.error('Error fetching user photos:', error)
      res.status(500).json({
        status: 'error',
        message: 'Помилка при завантаженні фотографій',
      })
    }
  }

  // Завантажити фотографії з покращеною безпекою
  async uploadPhotos(req, res) {
    try {
      const userId = req.user._id
      const files = req.files

      if (!files || files.length === 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Файли не знайдено',
        })
      }

      // Перевіряємо ліміт користувача
      const userPhotoCount = await Photo.countDocuments({ userId })
      const maxPhotosPerUser = 1000
      
      if (userPhotoCount + files.length > maxPhotosPerUser) {
        return res.status(400).json({
          status: 'fail',
          message: `Перевищено ліміт фотографій (${maxPhotosPerUser})`,
        })
      }

      const uploadedPhotos = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          const photoId = crypto.randomUUID()
          const filename = `${photoId}.jpg`

          // Отримуємо метадані з форми
          const description = req.body[`description_${i}`] || ''
          const location = req.body[`location_${i}`] || ''
          const hashtags = req.body[`hashtags_${i}`] || ''

          // Зберігаємо в БД як Base64
          const photo = new Photo({
            userId,
            filename,
            originalName: Buffer.from(file.originalname, 'latin1').toString('utf8').substring(0, 255),
            mimeType: file.mimetype,
            size: file.size,
            data: file.buffer.toString('base64'),
            description: description.substring(0, 500),
            location: location.substring(0, 100),
            hashtags: hashtags.substring(0, 200),
            metadata: {},
          })

          await photo.save()
          uploadedPhotos.push(photo)
        } catch (fileError) {
          console.error('Error processing file:', fileError)
          // продовжуємо з наступним файлом
        }
      }

      if (uploadedPhotos.length === 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Не вдалося обробити жоден файл',
        })
      }

      res.status(201).json({
        status: 'success',
        data: {
          photos: uploadedPhotos,
        },
        message: `Успішно завантажено ${uploadedPhotos.length} фото`,
      })
    } catch (error) {
      console.error('Error uploading photos:', error)
      res.status(500).json({
        status: 'error',
        message: 'Помилка при завантаженні фотографій',
      })
    }
  }

  // Видалити фотографію з перевіркою прав
  async deletePhoto(req, res) {
    try {
      const { photoId } = req.params
      const userId = req.user._id

      const photo = await Photo.findOne({ _id: photoId, userId })

      if (!photo) {
        return res.status(404).json({
          status: 'fail',
          message: 'Фотографію не знайдено або немає прав доступу',
        })
      }

      // Видаляємо файли безпечно
      const photoPath = path.join(__dirname, '../../uploads/photos', photo.filename)
      const thumbnailPath = path.join(__dirname, '../../uploads/thumbnails', photo.filename.replace('.jpg', '_thumb.jpg'))

      try {
        await fs.unlink(photoPath)
        await fs.unlink(thumbnailPath)
      } catch (fileError) {
        console.error('Error deleting files:', fileError)
        // продовжуємо видалення з БД навіть якщо файли не видалилися
      }

      await Photo.findByIdAndDelete(photoId)

      res.json({
        status: 'success',
        message: 'Фотографію видалено',
      })
    } catch (error) {
      console.error('Error deleting photo:', error)
      res.status(500).json({
        status: 'error',
        message: 'Помилка при видаленні фотографії',
      })
    }
  }

  // Отримати конкретну фотографію
  async getPhoto(req, res) {
    try {
      const { photoId } = req.params

      const photo = await Photo.findById(photoId)
        .populate('userId', 'name username')
        .select('-__v')

      if (!photo) {
        return res.status(404).json({
          status: 'fail',
          message: 'Фотографію не знайдено',
        })
      }

      // Перевіряємо права доступу
      if (!photo.isPublic && photo.userId._id.toString() !== req.user?.id) {
        return res.status(403).json({
          status: 'fail',
          message: 'Немає доступу до цієї фотографії',
        })
      }

      res.json({
        status: 'success',
        data: { photo },
      })
    } catch (error) {
      console.error('Error fetching photo:', error)
      res.status(500).json({
        status: 'error',
        message: 'Помилка при завантаженні фотографії',
      })
    }
  }

  // Оновити фотографію з валідацією
  async updatePhoto(req, res) {
    try {
      const { photoId } = req.params
      const { description, tags, isPublic } = req.body
      const userId = req.user._id

      const updateData = {}
      if (description !== undefined) updateData.description = description
      if (tags !== undefined) updateData.tags = tags
      if (isPublic !== undefined) updateData.isPublic = isPublic

      const photo = await Photo.findOneAndUpdate(
        { _id: photoId, userId },
        updateData,
        { new: true, runValidators: true }
      ).select('-__v')

      if (!photo) {
        return res.status(404).json({
          status: 'fail',
          message: 'Фотографію не знайдено або немає прав доступу',
        })
      }

      res.json({
        status: 'success',
        data: { photo },
        message: 'Фотографію оновлено',
      })
    } catch (error) {
      console.error('Error updating photo:', error)
      res.status(500).json({
        status: 'error',
        message: 'Помилка при оновленні фотографії',
      })
    }
  }

  // Лайкнути або дізлайкнути фото
  async togglePhotoLike(req, res) {
    try {
      const { photoId } = req.params
      const { type } = req.body // 'like' або 'dislike'
      const userId = req.user._id

      if (!['like', 'dislike'].includes(type)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Невірний тип реакції'
        })
      }

      const photo = await Photo.findById(photoId)
      if (!photo) {
        return res.status(404).json({
          status: 'fail',
          message: 'Фотографію не знайдено'
        })
      }

      const existingLike = await PhotoLike.findOne({ photoId, userId })

      if (existingLike) {
        if (existingLike.type === type) {
          // Видаляємо реакцію якщо вона така ж
          await PhotoLike.deleteOne({ photoId, userId })
        } else {
          // Змінюємо тип реакції
          existingLike.type = type
          await existingLike.save()
        }
      } else {
        // Створюємо нову реакцію
        await PhotoLike.create({ photoId, userId, type })
      }

      // Повертаємо оновлені дані
      const likes = await PhotoLike.countDocuments({ photoId, type: 'like' })
      const dislikes = await PhotoLike.countDocuments({ photoId, type: 'dislike' })
      const userReaction = await PhotoLike.findOne({ photoId, userId })

      res.json({
        status: 'success',
        data: {
          likes,
          dislikes,
          userReaction: userReaction?.type || null
        }
      })
    } catch (error) {
      console.error('Error toggling photo like:', error)
      res.status(500).json({
        status: 'error',
        message: 'Помилка при обробці реакції'
      })
    }
  }

  // Отримати коментарі до фото
  async getPhotoComments(req, res) {
    try {
      const { photoId } = req.params
      const { page = 1, limit = 20 } = req.query

      const pageNum = Math.max(1, parseInt(page))
      const limitNum = Math.min(50, Math.max(1, parseInt(limit)))

      const comments = await PhotoComment.find({ photoId })
        .populate('userId', 'name id')
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .select('-__v')

      const total = await PhotoComment.countDocuments({ photoId })

      // Очищаємо відповідь
      const cleanComments = comments.map(comment => {
        const commentObj = comment.toObject()
        if (commentObj.userId) {
          commentObj.user = {
            id: commentObj.userId.id,
            name: commentObj.userId.name
          }
          delete commentObj.userId
        }
        return commentObj
      })

      res.json({
        status: 'success',
        data: {
          comments: cleanComments,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      })
    } catch (error) {
      console.error('Error fetching comments:', error)
      res.status(500).json({
        status: 'error',
        message: 'Помилка при завантаженні коментарів'
      })
    }
  }

  // Додати коментар до фото
  async addPhotoComment(req, res) {
    try {
      const { photoId } = req.params
      const { text } = req.body
      const userId = req.user._id

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Текст коментаря не може бути порожнім'
        })
      }

      const photo = await Photo.findById(photoId)
      if (!photo) {
        return res.status(404).json({
          status: 'fail',
          message: 'Фотографію не знайдено'
        })
      }

      const comment = await PhotoComment.create({
        photoId,
        userId,
        text: text.trim()
      })

      const populatedComment = await PhotoComment.findById(comment._id)
        .populate('userId', 'name id')
        .select('-__v')

      const cleanComment = populatedComment.toObject()
      cleanComment.user = {
        id: cleanComment.userId.id,
        name: cleanComment.userId.name
      }
      delete cleanComment.userId

      res.status(201).json({
        status: 'success',
        data: { comment: cleanComment }
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      res.status(500).json({
        status: 'error',
        message: 'Помилка при додаванні коментаря'
      })
    }
  }
}

const photosController = new PhotosController()

module.exports = {
  photosController,
  upload,
}