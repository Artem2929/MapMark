const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  flag: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Country', countrySchema);