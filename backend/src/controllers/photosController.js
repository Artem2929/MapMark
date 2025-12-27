const Photo = require('../models/Photo')
const User = require('../models/User')
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises
const sharp = require('sharp')
const { v4: uuidv4 } = require('uuid')

// Налаштування multer для завантаження файлів
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Тільки зображення дозволені'), false)
    }
  },
})

class PhotosController {
  // Отримати фотографії користувача
  async getUserPhotos(req, res) {
    try {
      const { userId } = req.params
      const { page = 1, limit = 20 } = req.query

      const photos = await Photo.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('userId', 'name username')

      const total = await Photo.countDocuments({ userId })

      res.json({
        status: 'success',
        data: {
          photos,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
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

  // Завантажити фотографії
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

      const uploadedPhotos = []

      for (const file of files) {
        const photoId = uuidv4()
        const filename = `${photoId}.jpg`
        const thumbnailFilename = `${photoId}_thumb.jpg`

        // Створюємо директорії якщо не існують
        const uploadsDir = path.join(__dirname, '../../uploads/photos')
        const thumbnailsDir = path.join(__dirname, '../../uploads/thumbnails')
        
        await fs.mkdir(uploadsDir, { recursive: true })
        await fs.mkdir(thumbnailsDir, { recursive: true })

        const photoPath = path.join(uploadsDir, filename)
        const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename)

        // Обробляємо основне зображення
        await sharp(file.buffer)
          .resize(1920, 1080, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .jpeg({ quality: 85 })
          .toFile(photoPath)

        // Створюємо мініатюру
        await sharp(file.buffer)
          .resize(300, 300, { 
            fit: 'cover',
            position: 'center' 
          })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath)

        // Зберігаємо в базу даних
        const photo = new Photo({
          userId,
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/photos/${filename}`,
          thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`,
        })

        await photo.save()
        uploadedPhotos.push(photo)
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

  // Видалити фотографію
  async deletePhoto(req, res) {
    try {
      const { photoId } = req.params
      const userId = req.user.id

      const photo = await Photo.findOne({ _id: photoId, userId })

      if (!photo) {
        return res.status(404).json({
          status: 'fail',
          message: 'Фотографію не знайдено',
        })
      }

      // Видаляємо файли
      const photoPath = path.join(__dirname, '../../uploads/photos', photo.filename)
      const thumbnailPath = path.join(__dirname, '../../uploads/thumbnails', photo.filename.replace('.jpg', '_thumb.jpg'))

      try {
        await fs.unlink(photoPath)
        await fs.unlink(thumbnailPath)
      } catch (fileError) {
        console.error('Error deleting files:', fileError)
      }

      // Видаляємо з бази даних
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

      const photo = await Photo.findById(photoId).populate('userId', 'name username')

      if (!photo) {
        return res.status(404).json({
          status: 'fail',
          message: 'Фотографію не знайдено',
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

  // Оновити опис фотографії
  async updatePhoto(req, res) {
    try {
      const { photoId } = req.params
      const { description } = req.body
      const userId = req.user.id

      const photo = await Photo.findOneAndUpdate(
        { _id: photoId, userId },
        { description },
        { new: true }
      )

      if (!photo) {
        return res.status(404).json({
          status: 'fail',
          message: 'Фотографію не знайдено',
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