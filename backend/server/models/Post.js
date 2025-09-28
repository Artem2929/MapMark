const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'],
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

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'reactions.userId': 1 });

module.exports = mongoose.model('Post', postSchema);