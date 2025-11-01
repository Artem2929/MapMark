const mongoose = require('mongoose');

const regionSchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  countryValue: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Region', regionSchema);