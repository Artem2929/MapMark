const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: { type: String, required: true },
  address: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: String,
  shortDescription: { type: String, required: true },
  detailedDescription: String,
  photos: [String],
  overallRating: { type: Number, default: 0 },
  categoryRatings: {
    price: { type: Number, default: 0 },
    cleanliness: { type: Number, default: 0 },
    atmosphere: { type: Number, default: 0 },
    service: { type: Number, default: 0 }
  },
  tags: [String],
  workingHours: String,
  contacts: String,
  promoCode: String,
  isAnonymous: { type: Boolean, default: false },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  country: String,
  region: String,
  isNew: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  hasPromo: { type: Boolean, default: false },
  distance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

adSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Ad', adSchema);