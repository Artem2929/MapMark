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
        .populate('userId', 'name id avatar')
        .select('-__v')

      // Очищаємо відповідь від зайвих полів
      const cleanPhotos = photos.map(photo => {
        const photoObj = photo.toObject()
        const userData = photoObj.userId
        photoObj.userId = userData?.id || photoObj.userId
        
        // Конвертуємо avatar Buffer в base64 якщо потрібно
        let avatarBase64 = null
        if (userData?.avatar) {
          if (Buffer.isBuffer(userData.avatar)) {
            avatarBase64 = userData.avatar.toString('base64')
          } else if (typeof userData.avatar === 'string') {
            avatarBase64 = userData.avatar
          }
        }
        
        photoObj.user = {
          id: userData?.id,
          name: userData?.name,
          avatar: avatarBase64
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

      console.log('Upload request body:', req.body)
      console.log('Upload files:', files?.length)

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

          // Отримуємо метадані з форми - вони можуть бути в різних форматах
          let description = ''
          let location = ''
          let hashtags = ''
          
          // Перевіряємо всі можливі варіанти
          if (req.body.description) description = req.body.description
          if (req.body.location) location = req.body.location
          if (req.body.hashtags) hashtags = req.body.hashtags
          
          // Якщо дані в масиві (multer bug)
          if (Array.isArray(req.body.photos)) {
            if (req.body.photos[0]) description = req.body.photos[0]
            if (req.body.photos[1]) location = req.body.photos[1]
            if (req.body.photos[2]) hashtags = req.body.photos[2]
          }

          console.log('Photo metadata:', { description, location, hashtags })

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

      // Форматуємо відповідь так само, як у getUserPhotos
      const user = await User.findById(userId).select('name id avatar')
      const formattedPhotos = uploadedPhotos.map(photo => {
        const photoObj = photo.toObject()
        return {
          ...photoObj,
          _id: photoObj._id,
          userId: user.id,
          user: {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          }
        }
      })

      res.status(201).json({
        status: 'success',
        data: {
          photos: formattedPhotos,
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
      const { description, location, hashtags, isPublic } = req.body
      const userId = req.user._id

      const updateData = {}
      if (description !== undefined) updateData.description = description.substring(0, 500)
      if (location !== undefined) updateData.location = location.substring(0, 100)
      if (hashtags !== undefined) updateData.hashtags = hashtags.substring(0, 200)
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
        .populate('userId', 'name id avatar')
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .select('-__v')

      const total = await PhotoComment.countDocuments({ photoId })

      // Очищаємо відповідь
      const cleanComments = comments.map(comment => {
        const commentObj = comment.toObject()
        if (commentObj.userId) {
          let avatarBase64 = null
          if (commentObj.userId.avatar) {
            if (Buffer.isBuffer(commentObj.userId.avatar)) {
              avatarBase64 = commentObj.userId.avatar.toString('base64')
            } else if (typeof commentObj.userId.avatar === 'string') {
              avatarBase64 = commentObj.userId.avatar
            }
          }
          
          commentObj.user = {
            id: commentObj.userId.id,
            name: commentObj.userId.name,
            avatar: avatarBase64
          }
          delete commentObj.userId
        }
        
        commentObj.likesCount = commentObj.likes?.length || 0
        commentObj.dislikesCount = commentObj.dislikes?.length || 0
        commentObj.userReaction = commentObj.likes?.includes(req.user?._id) ? 'like' : commentObj.dislikes?.includes(req.user?._id) ? 'dislike' : null
        delete commentObj.likes
        delete commentObj.dislikes
        
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

      if (text.length > 1000) {
        return res.status(400).json({
          status: 'fail',
          message: 'Коментар не може перевищувати 1000 символів'
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
        .populate('userId', 'name id avatar')
        .select('-__v')

      const cleanComment = populatedComment.toObject()
      
      let avatarBase64 = null
      if (cleanComment.userId.avatar) {
        if (Buffer.isBuffer(cleanComment.userId.avatar)) {
          avatarBase64 = cleanComment.userId.avatar.toString('base64')
        } else if (typeof cleanComment.userId.avatar === 'string') {
          avatarBase64 = cleanComment.userId.avatar
        }
      }
      
      cleanComment.user = {
        id: cleanComment.userId.id,
        name: cleanComment.userId.name,
        avatar: avatarBase64
      }
      delete cleanComment.userId
      
      cleanComment.likesCount = 0
      cleanComment.dislikesCount = 0
      cleanComment.userReaction = null
      delete cleanComment.likes
      delete cleanComment.dislikes

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

  // Оновити коментар
  async updatePhotoComment(req, res) {
    try {
      const { photoId, commentId } = req.params
      const { text } = req.body
      const userId = req.user._id

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Текст коментаря не може бути порожнім'
        })
      }

      if (text.length > 1000) {
        return res.status(400).json({
          status: 'fail',
          message: 'Коментар не може перевищувати 1000 символів'
        })
      }

      const comment = await PhotoComment.findOne({ _id: commentId, photoId, userId })
      if (!comment) {
        return res.status(404).json({
          status: 'fail',
          message: 'Коментар не знайдено або немає прав доступу'
        })
      }

      comment.text = text.trim()
      await comment.save()

      const populatedComment = await PhotoComment.findById(comment._id)
        .populate('userId', 'name id avatar')
        .select('-__v')

      const cleanComment = populatedComment.toObject()
      
      let avatarBase64 = null
      if (cleanComment.userId.avatar) {
        if (Buffer.isBuffer(cleanComment.userId.avatar)) {
          avatarBase64 = cleanComment.userId.avatar.toString('base64')
        } else if (typeof cleanComment.userId.avatar === 'string') {
          avatarBase64 = cleanComment.userId.avatar
        }
      }
      
      cleanComment.user = {
        id: cleanComment.userId.id,
        name: cleanComment.userId.name,
        avatar: avatarBase64
      }
      delete cleanComment.userId
      
      cleanComment.likesCount = cleanComment.likes?.length || 0
      cleanComment.dislikesCount = cleanComment.dislikes?.length || 0
      cleanComment.userReaction = cleanComment.likes?.includes(userId) ? 'like' : cleanComment.dislikes?.includes(userId) ? 'dislike' : null
      delete cleanComment.likes
      delete cleanComment.dislikes

      res.json({
        status: 'success',
        data: { comment: cleanComment }
      })
    } catch (error) {
      console.error('Error updating comment:', error)
      res.status(500).json({
        status: 'error',
        message: 'Помилка при оновленні коментаря'
      })
    }
  }

  // Видалити коментар
  async deletePhotoComment(req, res) {
    try {
      const { photoId, commentId } = req.params
      const userId = req.user._id

      const comment = await PhotoComment.findOne({ _id: commentId, photoId, userId })
      if (!comment) {
        return res.status(404).json({
          status: 'fail',
          message: 'Коментар не знайдено або немає прав доступу'
        })
      }

      await PhotoComment.deleteOne({ _id: commentId })

      res.json({
        status: 'success',
        message: 'Коментар видалено'
      })
    } catch (error) {
      console.error('Error deleting comment:', error)
      res.status(500).json({
        status: 'error',
        message: 'Помилка при видаленні коментаря'
      })
    }
  }

  // Лайкнути або дізлайкнути коментар
  async toggleCommentLike(req, res) {
    try {
      const { photoId, commentId } = req.params
      const { type } = req.body
      const userId = req.user._id

      if (!['like', 'dislike'].includes(type)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Невірний тип реакції'
        })
      }

      const comment = await PhotoComment.findOne({ _id: commentId, photoId })
      if (!comment) {
        return res.status(404).json({
          status: 'fail',
          message: 'Коментар не знайдено'
        })
      }

      const hasLike = comment.likes.includes(userId)
      const hasDislike = comment.dislikes.includes(userId)

      if (type === 'like') {
        if (hasLike) {
          comment.likes.pull(userId)
        } else {
          comment.likes.push(userId)
          if (hasDislike) comment.dislikes.pull(userId)
        }
      } else {
        if (hasDislike) {
          comment.dislikes.pull(userId)
        } else {
          comment.dislikes.push(userId)
          if (hasLike) comment.likes.pull(userId)
        }
      }

      await comment.save()

      res.json({
        status: 'success',
        data: {
          likes: comment.likes.length,
          dislikes: comment.dislikes.length,
          userReaction: comment.likes.includes(userId) ? 'like' : comment.dislikes.includes(userId) ? 'dislike' : null
        }
      })
    } catch (error) {
      console.error('Error toggling comment like:', error)
      res.status(500).json({
        status: 'error',
        message: 'Помилка при обробці реакції'
      })
    }
  }
}

const photosController = new PhotosController()

module.exports = {
  photosController,
  upload,
}