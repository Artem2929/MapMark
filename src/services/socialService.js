// Social Service for MapMark - Friends, Following, Social Features
class SocialService {
  constructor() {
    this.friends = this.loadFriends();
    this.following = this.loadFollowing();
    this.socialSettings = this.loadSocialSettings();
  }

  loadFriends() {
    return JSON.parse(localStorage.getItem('mapmark_friends')) || [];
  }

  loadFollowing() {
    return JSON.parse(localStorage.getItem('mapmark_following')) || [];
  }

  loadSocialSettings() {
    return JSON.parse(localStorage.getItem('mapmark_social_settings')) || {
      shareLocation: true,
      showOnlineStatus: true,
      allowFriendRequests: true,
      notifyOnFriendActivity: true,
      publicProfile: false
    };
  }

  saveFriends() {
    localStorage.setItem('mapmark_friends', JSON.stringify(this.friends));
  }

  saveFollowing() {
    localStorage.setItem('mapmark_following', JSON.stringify(this.following));
  }

  saveSocialSettings() {
    localStorage.setItem('mapmark_social_settings', JSON.stringify(this.socialSettings));
  }

  // Friend Management
  async sendFriendRequest(userId) {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Запит на дружбу надіслано' });
      }, 500);
    });
  }

  async acceptFriendRequest(userId) {
    const friend = {
      id: userId,
      name: `User ${userId}`,
      avatar: '👤',
      level: Math.floor(Math.random() * 10) + 1,
      lastSeen: new Date().toISOString(),
      mutualFriends: Math.floor(Math.random() * 5)
    };

    this.friends.push(friend);
    this.saveFriends();
    
    return { success: true, friend };
  }

  removeFriend(userId) {
    this.friends = this.friends.filter(friend => friend.id !== userId);
    this.saveFriends();
  }

  // Following System
  followUser(userId) {
    if (!this.following.includes(userId)) {
      this.following.push(userId);
      this.saveFollowing();
    }
  }

  unfollowUser(userId) {
    this.following = this.following.filter(id => id !== userId);
    this.saveFollowing();
  }

  isFollowing(userId) {
    return this.following.includes(userId);
  }

  // Social Feed
  async getFriendActivity(limit = 20) {
    // Mock friend activities
    const activities = [
      {
        id: 1,
        userId: 'friend1',
        userName: 'Олена К.',
        userAvatar: '👩',
        type: 'review',
        action: 'залишила відгук',
        place: 'Кафе "Львівська кава"',
        rating: 5,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        content: 'Неймовірна атмосфера!'
      },
      {
        id: 2,
        userId: 'friend2',
        userName: 'Максим П.',
        userAvatar: '👨',
        type: 'photo',
        action: 'додав фото',
        place: 'Парк Шевченка',
        photoCount: 3,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        content: 'Чудовий ранок для пробіжки!'
      }
    ];

    return activities.slice(0, limit);
  }

  // Nearby Friends
  async getNearbyFriends(userLocation, radius = 5000) {
    // Mock nearby friends
    const nearbyFriends = this.friends.filter(friend => {
      // Simulate distance calculation
      const distance = Math.random() * radius;
      return distance < radius;
    }).map(friend => ({
      ...friend,
      distance: Math.floor(Math.random() * radius),
      isOnline: Math.random() > 0.5,
      currentPlace: Math.random() > 0.5 ? 'Кафе "Central"' : null
    }));

    return nearbyFriends;
  }

  // Social Recommendations
  async getSocialRecommendations(userLocation) {
    const recommendations = [
      {
        type: 'friend_visited',
        place: 'Ресторан "Bernardazzi"',
        friend: 'Олена К.',
        rating: 4.8,
        reason: 'Ваш друг відвідав це місце минулого тижня'
      },
      {
        type: 'popular_among_friends',
        place: 'Кафе "Львівська кава"',
        friendCount: 3,
        avgRating: 4.6,
        reason: '3 ваших друзів рекомендують це місце'
      }
    ];

    return recommendations;
  }

  // Group Activities
  async createGroup(name, description, members = []) {
    const group = {
      id: Date.now().toString(),
      name,
      description,
      members: [{ id: 'current_user', role: 'admin' }, ...members],
      createdAt: new Date().toISOString(),
      activities: []
    };

    return group;
  }

  async planGroupActivity(groupId, activity) {
    // Mock group activity planning
    return {
      id: Date.now().toString(),
      groupId,
      ...activity,
      createdAt: new Date().toISOString(),
      responses: []
    };
  }

  // Privacy & Settings
  updateSocialSettings(newSettings) {
    this.socialSettings = { ...this.socialSettings, ...newSettings };
    this.saveSocialSettings();
  }

  getSocialSettings() {
    return this.socialSettings;
  }

  // Social Stats
  getSocialStats() {
    return {
      friendsCount: this.friends.length,
      followingCount: this.following.length,
      followersCount: Math.floor(Math.random() * 50) + 10, // Mock
      mutualConnections: Math.floor(Math.random() * 20),
      socialScore: Math.floor(Math.random() * 100) + 50
    };
  }

  // Friend Suggestions
  async getFriendSuggestions() {
    const suggestions = [
      {
        id: 'suggestion1',
        name: 'Анна С.',
        avatar: '👩🦰',
        mutualFriends: 3,
        commonPlaces: 5,
        reason: '3 спільних друзі'
      },
      {
        id: 'suggestion2',
        name: 'Дмитро Л.',
        avatar: '👨💼',
        mutualFriends: 1,
        commonPlaces: 8,
        reason: 'Відвідує схожі місця'
      }
    ];

    return suggestions;
  }

  // Social Notifications
  getSocialNotifications() {
    return [
      {
        id: 1,
        type: 'friend_request',
        from: 'Анна С.',
        message: 'хоче додати вас у друзі',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        action: 'accept_friend'
      },
      {
        id: 2,
        type: 'friend_activity',
        from: 'Олена К.',
        message: 'залишила відгук про місце поблизу',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        action: 'view_review'
      }
    ];
  }
}

export default new SocialService();