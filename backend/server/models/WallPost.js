const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: String, required: true },
  userId: { type: String },
  avatar: { type: String },
  text: { type: String, required: true },
  date: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const wallPostSchema = new mongoose.Schema({
  author: { type: String, required: true },
  userId: { type: String, required: true },
  content: { type: String, required: true },
  images: [String],
  files: [String],
  hashtags: { type: String },
  location: {
    name: String,
    lat: Number,
    lng: Number
  },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  likedBy: [String],
  dislikedBy: [String],
  shares: { type: Number, default: 0 },
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WallPost', wallPostSchema);