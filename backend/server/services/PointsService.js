const UserPoints = require('../models/UserPoints');
const Rating = require('../models/Rating');

class PointsService {
  // Отримати або створити запис балів користувача
  async getUserPoints(userId) {
    let userPoints = await UserPoints.findOne({ userId });
    if (!userPoints) {
      userPoints = new UserPoints({ userId });
      await userPoints.save();
    }
    return userPoints;
  }

  // Додати бали за відгук
  async addReviewPoints(userId, hasPhotos = false, photoCount = 0) {
    const userPoints = await this.getUserPoints(userId);
    
    // +2 бали за відгук
    userPoints.reviewPoints += 2;
    
    // +3 бали за відгук з фото (мінімум 3 фото)
    if (hasPhotos && photoCount >= 3) {
      userPoints.photoPoints += 3;
    }
    
    await userPoints.updateTotalPoints();
    await this.checkAchievements(userId);
    return userPoints;
  }

  // Додати бали за нове місце
  async addPlacePoints(userId, isVerified = false) {
    const userPoints = await this.getUserPoints(userId);
    
    // +1 бал за додавання місця
    userPoints.placePoints += 1;
    
    // +5 балів за верифіковане місце
    if (isVerified) {
      userPoints.placePoints += 5;
    }
    
    await userPoints.updateTotalPoints();
    await this.checkAchievements(userId);
    return userPoints;
  }

  // Додати бали за лайки
  async addLikePoints(userId, likeCount) {
    const userPoints = await this.getUserPoints(userId);
    
    // +1 бал за кожні 10 лайків
    const pointsToAdd = Math.floor(likeCount / 10);
    userPoints.activityPoints += pointsToAdd;
    
    await userPoints.updateTotalPoints();
    return userPoints;
  }

  // Додати бали за активність
  async addActivityPoints(userId) {
    const userPoints = await this.getUserPoints(userId);
    const today = new Date();
    const lastActivity = userPoints.lastActivityDate;
    
    // Перевірка щоденної активності
    const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Щоденна активність +2 бали
      userPoints.activityPoints += 2;
    }
    
    userPoints.lastActivityDate = today;
    await userPoints.updateTotalPoints();
    return userPoints;
  }

  // Додати штрафні бали
  async addPenalty(userId, reason, points) {
    const userPoints = await this.getUserPoints(userId);
    userPoints.penaltyPoints += points;
    
    await userPoints.updateTotalPoints();
    return userPoints;
  }

  // Перевірка досягнень
  async checkAchievements(userId) {
    const userPoints = await this.getUserPoints(userId);
    
    // Підрахунок статистики (тут потрібно буде додати запити до інших моделей)
    // Поки що заглушки
    const reviewCount = Math.floor(userPoints.reviewPoints / 2);
    const placeCount = userPoints.placePoints;
    const photoCount = Math.floor(userPoints.photoPoints / 3);
    
    const achievements = [];
    
    // Першовідкривач (10 нових місць)
    if (placeCount >= 10 && !userPoints.achievements.find(a => a.name === 'explorer')) {
      achievements.push({ name: 'explorer', points: 20 });
      userPoints.achievementPoints += 20;
    }
    
    // Фотограф (100 фото в відгуках)
    if (photoCount >= 100 && !userPoints.achievements.find(a => a.name === 'photographer')) {
      achievements.push({ name: 'photographer', points: 15 });
      userPoints.achievementPoints += 15;
    }
    
    // Експерт (50 якісних відгуків)
    if (reviewCount >= 50 && !userPoints.achievements.find(a => a.name === 'expert')) {
      achievements.push({ name: 'expert', points: 25 });
      userPoints.achievementPoints += 25;
    }
    
    if (achievements.length > 0) {
      userPoints.achievements.push(...achievements);
      await userPoints.updateTotalPoints();
    }
    
    return achievements;
  }

  // Отримати рейтинг з голосами
  async getTotalRating(userId) {
    const userPoints = await this.getUserPoints(userId);
    const ratings = await Rating.find({ userId });
    const votePoints = ratings.reduce((sum, rating) => sum + rating.vote, 0);
    
    // Оновлюємо бали з голосів
    userPoints.votePoints = votePoints;
    await userPoints.updateTotalPoints();
    
    return {
      totalPoints: userPoints.totalPoints,
      breakdown: {
        reviews: userPoints.reviewPoints,
        photos: userPoints.photoPoints,
        places: userPoints.placePoints,
        activity: userPoints.activityPoints,
        achievements: userPoints.achievementPoints,
        votes: userPoints.votePoints,
        penalties: userPoints.penaltyPoints
      },
      achievements: userPoints.achievements
    };
  }
}

module.exports = new PointsService();