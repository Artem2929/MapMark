const Photo = require('../models/Photo')
const User = require('../models/User')
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises
const sharp = require('sharp')
const { v4: uuidv4 } = require('uuid')
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

      const photos = await Photo.find({ 
        userId,
        $or: [
          { isPublic: true },
          { userId: req.user?.id } // власні фото завжди видимі
        ]
      })
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .populate('userId', 'name username')
        .select('-__v')

      const total = await Photo.countDocuments({ 
        userId,
        $or: [
          { isPublic: true },
          { userId: req.user?.id }
        ]
      })

      res.json({
        status: 'success',
        data: {
          photos,
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
      const userId = req.user.id
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
      const uploadsDir = path.join(__dirname, '../../uploads/photos')
      const thumbnailsDir = path.join(__dirname, '../../uploads/thumbnails')
      
      // Створюємо директорії
      await fs.mkdir(uploadsDir, { recursive: true })
      await fs.mkdir(thumbnailsDir, { recursive: true })

      for (const file of files) {
        try {
          const photoId = uuidv4()
          const filename = `${photoId}.jpg`
          const thumbnailFilename = `${photoId}_thumb.jpg`
          const photoPath = path.join(uploadsDir, filename)
          const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename)

          // Обробляємо зображення з sharp (безпечно)
          const metadata = await sharp(file.buffer).metadata()
          
          // Перевіряємо розміри
          if (metadata.width > 8000 || metadata.height > 8000) {
            continue // пропускаємо занадто великі зображення
          }

          // Основне зображення
          await sharp(file.buffer)
            .resize(1920, 1080, { 
              fit: 'inside',
              withoutEnlargement: true 
            })
            .jpeg({ quality: 85, mozjpeg: true })
            .toFile(photoPath)

          // Мініатюра
          await sharp(file.buffer)
            .resize(300, 300, { 
              fit: 'cover',
              position: 'center' 
            })
            .jpeg({ quality: 80, mozjpeg: true })
            .toFile(thumbnailPath)

          // Зберігаємо в БД
          const photo = new Photo({
            userId,
            filename,
            originalName: file.originalname.substring(0, 255), // обмежуємо довжину
            mimeType: file.mimetype,
            size: file.size,
            url: `/uploads/photos/${filename}`,
            thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`,
            metadata: {
              width: metadata.width,
              height: metadata.height,
            },
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
      const userId = req.user.id

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
      const userId = req.user.id

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
}

const photosController = new PhotosController()

module.exports = {
  photosController,
  upload,
}