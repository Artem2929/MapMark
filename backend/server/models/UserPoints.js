const mongoose = require('mongoose');

const userPointsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  reviewPoints: {
    type: Number,
    default: 0
  },
  photoPoints: {
    type: Number,
    default: 0
  },
  placePoints: {
    type: Number,
    default: 0
  },
  activityPoints: {
    type: Number,
    default: 0
  },
  achievementPoints: {
    type: Number,
    default: 0
  },
  votePoints: {
    type: Number,
    default: 0
  },
  penaltyPoints: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  },
  achievements: [{
    name: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    points: Number
  }]
}, {
  timestamps: true
});

// Обчислення загального рейтингу
userPointsSchema.virtual('rating').get(function() {
  return Math.max(0, this.totalPoints);
});

// Оновлення загального рейтингу
userPointsSchema.methods.updateTotalPoints = function() {
  this.totalPoints = this.reviewPoints + this.photoPoints + this.placePoints + 
                    this.activityPoints + this.achievementPoints + this.votePoints - this.penaltyPoints;
  return this.save();
};

module.exports = mongoose.model('UserPoints', userPointsSchema);