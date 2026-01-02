const mongoose = require('mongoose')

const photoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  data: {
    type: String, // Base64 дані зображення
    required: true,
  },
  description: {
    type: String,
    maxlength: 500,
    default: '',
  },
  location: {
    type: String,
    maxlength: 100,
    default: '',
  },
  hashtags: {
    type: String,
    maxlength: 200,
    default: '',
  },
  tags: [{
    type: String,
    maxlength: 50,
  }],
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isPublic: {
    type: Boolean,
    default: true,
  },
  metadata: {
    width: Number,
    height: Number,
    exif: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
})

// Індекси для оптимізації запитів
photoSchema.index({ userId: 1, createdAt: -1 })
photoSchema.index({ isPublic: 1, createdAt: -1 })
photoSchema.index({ tags: 1 })

// Віртуальні поля
photoSchema.virtual('likesCount').get(function() {
  return this.likes.length
})

photoSchema.virtual('commentsCount').get(function() {
  return this.comments.length
})

// Методи
photoSchema.methods.addLike = function(userId) {
  const existingLike = this.likes.find(like => like.userId.toString() === userId.toString())
  if (!existingLike) {
    this.likes.push({ userId })
    return this.save()
  }
  return this
}

photoSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.userId.toString() !== userId.toString())
  return this.save()
}

photoSchema.methods.addComment = function(userId, text) {
  this.comments.push({ userId, text })
  return this.save()
}

// Middleware для очищення файлів при видаленні
photoSchema.pre('findOneAndDelete', async function() {
  const photo = await this.model.findOne(this.getQuery())
  if (photo) {
    const fs = require('fs').promises
    const path = require('path')
    
    try {
      const photoPath = path.join(__dirname, '../../uploads/photos', photo.filename)
      const thumbnailPath = path.join(__dirname, '../../uploads/thumbnails', photo.filename.replace('.jpg', '_thumb.jpg'))
      
      await fs.unlink(photoPath).catch(() => {})
      await fs.unlink(thumbnailPath).catch(() => {})
    } catch (error) {
      console.error('Error cleaning up files:', error)
    }
  }
})

// Трансформація JSON відповіді
photoSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

const Photo = mongoose.model('Photo', photoSchema)

module.exports = Photo