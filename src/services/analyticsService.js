// Analytics Service for MapMark - User Behavior, Place Analytics, Insights
class AnalyticsService {
  constructor() {
    this.userAnalytics = this.loadUserAnalytics();
    this.placeAnalytics = this.loadPlaceAnalytics();
  }

  loadUserAnalytics() {
    return JSON.parse(localStorage.getItem('mapmark_user_analytics')) || {
      totalSessions: 0,
      totalTimeSpent: 0,
      placesVisited: [],
      searchHistory: [],
      categoryPreferences: {},
      timePatterns: {},
      locationHistory: []
    };
  }

  loadPlaceAnalytics() {
    return JSON.parse(localStorage.getItem('mapmark_place_analytics')) || {};
  }

  saveUserAnalytics() {
    localStorage.setItem('mapmark_user_analytics', JSON.stringify(this.userAnalytics));
  }

  savePlaceAnalytics() {
    localStorage.setItem('mapmark_place_analytics', JSON.stringify(this.placeAnalytics));
  }

  // User Behavior Tracking
  trackSession() {
    this.userAnalytics.totalSessions++;
    this.userAnalytics.sessionStart = Date.now();
    this.saveUserAnalytics();
  }

  endSession() {
    if (this.userAnalytics.sessionStart) {
      const sessionTime = Date.now() - this.userAnalytics.sessionStart;
      this.userAnalytics.totalTimeSpent += sessionTime;
      delete this.userAnalytics.sessionStart;
      this.saveUserAnalytics();
    }
  }

  trackPlaceVisit(place) {
    const visit = {
      placeId: place.id,
      placeName: place.name,
      category: place.category,
      timestamp: new Date().toISOString(),
      duration: null
    };

    this.userAnalytics.placesVisited.push(visit);
    
    // Update category preferences
    if (!this.userAnalytics.categoryPreferences[place.category]) {
      this.userAnalytics.categoryPreferences[place.category] = 0;
    }
    this.userAnalytics.categoryPreferences[place.category]++;

    // Track time patterns
    const hour = new Date().getHours();
    if (!this.userAnalytics.timePatterns[hour]) {
      this.userAnalytics.timePatterns[hour] = 0;
    }
    this.userAnalytics.timePatterns[hour]++;

    this.saveUserAnalytics();
  }

  trackSearch(query, category = null) {
    const search = {
      query,
      category,
      timestamp: new Date().toISOString(),
      results: Math.floor(Math.random() * 50) + 1 // Mock results count
    };

    this.userAnalytics.searchHistory.push(search);
    
    // Keep only last 100 searches
    if (this.userAnalytics.searchHistory.length > 100) {
      this.userAnalytics.searchHistory = this.userAnalytics.searchHistory.slice(-100);
    }

    this.saveUserAnalytics();
  }

  trackLocationUpdate(location) {
    const locationEntry = {
      lat: location.lat,
      lng: location.lng,
      timestamp: new Date().toISOString()
    };

    this.userAnalytics.locationHistory.push(locationEntry);
    
    // Keep only last 50 locations
    if (this.userAnalytics.locationHistory.length > 50) {
      this.userAnalytics.locationHistory = this.userAnalytics.locationHistory.slice(-50);
    }

    this.saveUserAnalytics();
  }

  // Place Analytics
  trackPlaceInteraction(placeId, interaction) {
    if (!this.placeAnalytics[placeId]) {
      this.placeAnalytics[placeId] = {
        views: 0,
        reviews: 0,
        photos: 0,
        shares: 0,
        bookmarks: 0,
        directions: 0,
        calls: 0,
        website_clicks: 0
      };
    }

    this.placeAnalytics[placeId][interaction]++;
    this.savePlaceAnalytics();
  }

  // User Insights
  getUserInsights() {
    const insights = {
      totalPlacesVisited: this.userAnalytics.placesVisited.length,
      favoriteCategory: this.getFavoriteCategory(),
      mostActiveHour: this.getMostActiveHour(),
      averageSessionTime: this.getAverageSessionTime(),
      searchPatterns: this.getSearchPatterns(),
      locationPatterns: this.getLocationPatterns(),
      weeklyActivity: this.getWeeklyActivity()
    };

    return insights;
  }

  getFavoriteCategory() {
    const categories = this.userAnalytics.categoryPreferences;
    return Object.keys(categories).reduce((a, b) => 
      categories[a] > categories[b] ? a : b, 'Кафе'
    );
  }

  getMostActiveHour() {
    const timePatterns = this.userAnalytics.timePatterns;
    return Object.keys(timePatterns).reduce((a, b) => 
      timePatterns[a] > timePatterns[b] ? a : b, '12'
    );
  }

  getAverageSessionTime() {
    if (this.userAnalytics.totalSessions === 0) return 0;
    return Math.round(this.userAnalytics.totalTimeSpent / this.userAnalytics.totalSessions / 1000 / 60); // minutes
  }

  getSearchPatterns() {
    const searches = this.userAnalytics.searchHistory;
    const patterns = {};
    
    searches.forEach(search => {
      const words = search.query.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 2) {
          patterns[word] = (patterns[word] || 0) + 1;
        }
      });
    });

    return Object.entries(patterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  }

  getLocationPatterns() {
    const locations = this.userAnalytics.locationHistory;
    if (locations.length === 0) return null;

    // Calculate center of activity
    const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;

    // Calculate activity radius
    const distances = locations.map(loc => 
      this.calculateDistance({ lat: avgLat, lng: avgLng }, loc)
    );
    const avgRadius = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;

    return {
      center: { lat: avgLat, lng: avgLng },
      radius: Math.round(avgRadius * 1000), // meters
      mostVisitedArea: this.getMostVisitedArea(locations)
    };
  }

  getMostVisitedArea(locations) {
    // Simple clustering - group locations within 1km
    const clusters = [];
    
    locations.forEach(location => {
      let addedToCluster = false;
      
      for (let cluster of clusters) {
        const distance = this.calculateDistance(cluster.center, location);
        if (distance < 1) { // 1km
          cluster.locations.push(location);
          // Recalculate center
          cluster.center.lat = cluster.locations.reduce((sum, loc) => sum + loc.lat, 0) / cluster.locations.length;
          cluster.center.lng = cluster.locations.reduce((sum, loc) => sum + loc.lng, 0) / cluster.locations.length;
          addedToCluster = true;
          break;
        }
      }
      
      if (!addedToCluster) {
        clusters.push({
          center: { lat: location.lat, lng: location.lng },
          locations: [location]
        });
      }
    });

    // Return largest cluster
    return clusters.reduce((largest, cluster) => 
      cluster.locations.length > largest.locations.length ? cluster : largest,
      { locations: [] }
    );
  }

  getWeeklyActivity() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentVisits = this.userAnalytics.placesVisited.filter(visit => 
      new Date(visit.timestamp) > weekAgo
    );

    const dailyActivity = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayKey = date.toDateString();
      dailyActivity[dayKey] = 0;
    }

    recentVisits.forEach(visit => {
      const dayKey = new Date(visit.timestamp).toDateString();
      if (dailyActivity[dayKey] !== undefined) {
        dailyActivity[dayKey]++;
      }
    });

    return dailyActivity;
  }

  calculateDistance(pos1, pos2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(pos2.lat - pos1.lat);
    const dLon = this.toRad(pos2.lng - pos1.lng);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(pos1.lat)) * Math.cos(this.toRad(pos2.lat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRad(deg) {
    return deg * (Math.PI / 180);
  }

  // Place Insights
  getPlaceInsights(placeId) {
    const analytics = this.placeAnalytics[placeId];
    if (!analytics) return null;

    return {
      totalInteractions: Object.values(analytics).reduce((sum, count) => sum + count, 0),
      mostPopularAction: Object.keys(analytics).reduce((a, b) => 
        analytics[a] > analytics[b] ? a : b
      ),
      engagementScore: this.calculateEngagementScore(analytics),
      analytics
    };
  }

  calculateEngagementScore(analytics) {
    const weights = {
      views: 1,
      reviews: 5,
      photos: 3,
      shares: 4,
      bookmarks: 3,
      directions: 2,
      calls: 6,
      website_clicks: 2
    };

    let score = 0;
    Object.entries(analytics).forEach(([action, count]) => {
      score += count * (weights[action] || 1);
    });

    return Math.min(100, Math.round(score / 10)); // Normalize to 0-100
  }

  // Export Analytics
  exportUserData() {
    return {
      userAnalytics: this.userAnalytics,
      placeAnalytics: this.placeAnalytics,
      insights: this.getUserInsights(),
      exportDate: new Date().toISOString()
    };
  }

  // Clear Analytics
  clearUserData() {
    this.userAnalytics = {
      totalSessions: 0,
      totalTimeSpent: 0,
      placesVisited: [],
      searchHistory: [],
      categoryPreferences: {},
      timePatterns: {},
      locationHistory: []
    };
    this.placeAnalytics = {};
    
    this.saveUserAnalytics();
    this.savePlaceAnalytics();
  }
}

export default new AnalyticsService();