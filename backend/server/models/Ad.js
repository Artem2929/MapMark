const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true, maxlength: 200 },
  details: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'USD' },
  contactPhone: { type: String },
  contactEmail: { type: String },
  photos: [{
    url: String,
    filename: String,
    size: Number,
    mimetype: String
  }],
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

adSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Ad', adSchema);