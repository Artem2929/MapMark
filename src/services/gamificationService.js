// Gamification Service - Badges, Points, Levels, Achievements
class GamificationService {
  constructor() {
    this.userStats = this.loadUserStats();
    this.badges = this.initBadges();
    this.levels = this.initLevels();
  }

  loadUserStats() {
    return JSON.parse(localStorage.getItem('mapmark_user_stats')) || {
      points: 0,
      level: 1,
      reviewsCount: 0,
      photosCount: 0,
      placesVisited: 0,
      badges: [],
      streak: 0,
      lastActivity: null
    };
  }

  saveUserStats() {
    localStorage.setItem('mapmark_user_stats', JSON.stringify(this.userStats));
  }

  initBadges() {
    return {
      // Review Badges
      firstReview: { id: 'first_review', name: 'Перший відгук', icon: '🌟', points: 10 },
      reviewer: { id: 'reviewer', name: 'Рецензент', icon: '📝', points: 50, requirement: 10 },
      expertReviewer: { id: 'expert_reviewer', name: 'Експерт відгуків', icon: '🏆', points: 200, requirement: 100 },
      
      // Photo Badges
      photographer: { id: 'photographer', name: 'Фотограф', icon: '📸', points: 30, requirement: 5 },
      instagrammer: { id: 'instagrammer', name: 'Інстаграмер', icon: '📱', points: 100, requirement: 50 },
      
      // Explorer Badges
      explorer: { id: 'explorer', name: 'Дослідник', icon: '🗺️', points: 40, requirement: 10 },
      worldTraveler: { id: 'world_traveler', name: 'Мандрівник', icon: '✈️', points: 300, requirement: 50 },
      
      // Social Badges
      socialButterfly: { id: 'social', name: 'Соціальний', icon: '🦋', points: 60, requirement: 20 },
      influencer: { id: 'influencer', name: 'Інфлюенсер', icon: '👑', points: 500, requirement: 100 },
      
      // Special Badges
      earlyBird: { id: 'early_bird', name: 'Рання пташка', icon: '🐦', points: 25 },
      nightOwl: { id: 'night_owl', name: 'Нічна сова', icon: '🦉', points: 25 },
      weekendWarrior: { id: 'weekend', name: 'Вікенд воїн', icon: '⚔️', points: 35 },
      
      // Achievement Badges
      perfectScore: { id: 'perfect_score', name: 'Ідеальна оцінка', icon: '💯', points: 75 },
      helpfulReviewer: { id: 'helpful', name: 'Корисний рецензент', icon: '👍', points: 80 },
      trendsetter: { id: 'trendsetter', name: 'Законодавець моди', icon: '🔥', points: 150 }
    };
  }

  initLevels() {
    return [
      { level: 1, name: 'Новачок', minPoints: 0, maxPoints: 99, icon: '🌱' },
      { level: 2, name: 'Дослідник', minPoints: 100, maxPoints: 299, icon: '🔍' },
      { level: 3, name: 'Мандрівник', minPoints: 300, maxPoints: 599, icon: '🎒' },
      { level: 4, name: 'Експерт', minPoints: 600, maxPoints: 999, icon: '🎓' },
      { level: 5, name: 'Майстер', minPoints: 1000, maxPoints: 1999, icon: '⭐' },
      { level: 6, name: 'Легенда', minPoints: 2000, maxPoints: Infinity, icon: '👑' }
    ];
  }

  // Add points and check for level up
  addPoints(points, action) {
    this.userStats.points += points;
    this.userStats.lastActivity = new Date().toISOString();
    
    const newLevel = this.calculateLevel();
    const leveledUp = newLevel > this.userStats.level;
    
    if (leveledUp) {
      this.userStats.level = newLevel;
    }

    this.saveUserStats();
    
    return {
      pointsAdded: points,
      totalPoints: this.userStats.points,
      leveledUp,
      newLevel: newLevel,
      action
    };
  }

  // Calculate current level based on points
  calculateLevel() {
    return this.levels.find(level => 
      this.userStats.points >= level.minPoints && 
      this.userStats.points <= level.maxPoints
    )?.level || 1;
  }

  // Award badge
  awardBadge(badgeId) {
    if (!this.userStats.badges.includes(badgeId) && this.badges[badgeId]) {
      this.userStats.badges.push(badgeId);
      this.addPoints(this.badges[badgeId].points, `Отримано бейдж: ${this.badges[badgeId].name}`);
      this.saveUserStats();
      return this.badges[badgeId];
    }
    return null;
  }

  // Check and award badges based on activity
  checkBadges(activity) {
    const newBadges = [];

    switch (activity.type) {
      case 'review':
        this.userStats.reviewsCount++;
        if (this.userStats.reviewsCount === 1) {
          newBadges.push(this.awardBadge('firstReview'));
        }
        if (this.userStats.reviewsCount === 10) {
          newBadges.push(this.awardBadge('reviewer'));
        }
        if (this.userStats.reviewsCount === 100) {
          newBadges.push(this.awardBadge('expertReviewer'));
        }
        break;

      case 'photo':
        this.userStats.photosCount++;
        if (this.userStats.photosCount === 5) {
          newBadges.push(this.awardBadge('photographer'));
        }
        if (this.userStats.photosCount === 50) {
          newBadges.push(this.awardBadge('instagrammer'));
        }
        break;

      case 'visit':
        this.userStats.placesVisited++;
        if (this.userStats.placesVisited === 10) {
          newBadges.push(this.awardBadge('explorer'));
        }
        if (this.userStats.placesVisited === 50) {
          newBadges.push(this.awardBadge('worldTraveler'));
        }
        break;
    }

    // Time-based badges
    const hour = new Date().getHours();
    if (hour >= 5 && hour <= 8) {
      newBadges.push(this.awardBadge('earlyBird'));
    }
    if (hour >= 22 || hour <= 2) {
      newBadges.push(this.awardBadge('nightOwl'));
    }

    return newBadges.filter(Boolean);
  }

  // Get user progress
  getUserProgress() {
    const currentLevel = this.levels.find(l => l.level === this.userStats.level);
    const nextLevel = this.levels.find(l => l.level === this.userStats.level + 1);
    
    return {
      ...this.userStats,
      currentLevel,
      nextLevel,
      progressToNext: nextLevel ? 
        ((this.userStats.points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100 : 100
    };
  }

  // Get leaderboard position (mock)
  getLeaderboardPosition() {
    return Math.floor(Math.random() * 1000) + 1;
  }

  // Daily streak management
  updateStreak() {
    const today = new Date().toDateString();
    const lastActivity = this.userStats.lastActivity ? 
      new Date(this.userStats.lastActivity).toDateString() : null;
    
    if (lastActivity === today) {
      return; // Already active today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastActivity === yesterday.toDateString()) {
      this.userStats.streak++;
    } else {
      this.userStats.streak = 1;
    }

    this.userStats.lastActivity = new Date().toISOString();
    this.saveUserStats();
  }
}

export default new GamificationService();