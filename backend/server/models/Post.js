const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'dislike', 'love', 'laugh', 'wow', 'sad', 'angry'],
    required: true
  }
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  reactions: [reactionSchema],
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  images: [{
    url: String,
    publicId: String
  }],
  type: {
    type: String,
    enum: ['text', 'image', 'location'],
    default: 'text'
  },
  location: {
    type: String,
    maxlength: 200
  },
  mood: {
    type: String,
    enum: ['happy', 'excited', 'grateful', 'relaxed', 'thoughtful', ''],
    default: ''
  },
  reactions: [reactionSchema],
  comments: [commentSchema],
  shares: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  category: {
    type: String,
    enum: ['nature', 'city', 'food', 'travel', 'people', 'other', ''],
    default: ''
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

postSchema.virtual('likesCount').get(function() {
  return this.reactions.length;
});

postSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

// Індекси для продуктивності
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ isDeleted: 1, createdAt: -1 });
postSchema.index({ 'reactions.userId': 1 });
postSchema.index({ location: 'text' });
postSchema.index({ content: 'text' });

module.exports = mongoose.model('Post', postSchema);