const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  bio: { type: String, required: true, trim: true },
  avatar: { type: String, default: null },
  email: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  github: { type: String, trim: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);