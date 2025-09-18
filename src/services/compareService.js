// Quick Compare Service - Швидке порівняння місць
class CompareService {
  constructor() {
    this.compareList = [];
    this.maxCompareItems = 3;
  }

  // Додавання місця для порівняння
  addToCompare(place) {
    if (this.compareList.length >= this.maxCompareItems) {
      return { success: false, message: `Максимум ${this.maxCompareItems} місця для порівняння` };
    }

    if (this.isInCompare(place.id)) {
      return { success: false, message: 'Місце вже додано для порівняння' };
    }

    this.compareList.push({
      id: place.id,
      name: place.name,
      category: place.category,
      rating: place.rating || 0,
      priceLevel: place.priceLevel || 0,
      distance: place.distance || 0,
      lat: place.lat,
      lng: place.lng,
      phone: place.phone,
      website: place.website,
      workingHours: place.workingHours,
      photos: place.photos || [],
      reviews: place.reviews || [],
      addedAt: new Date().toISOString()
    });

    return { success: true, message: 'Місце додано для порівняння' };
  }

  // Видалення місця з порівняння
  removeFromCompare(placeId) {
    const initialLength = this.compareList.length;
    this.compareList = this.compareList.filter(place => place.id !== placeId);
    return this.compareList.length < initialLength;
  }

  // Очищення списку порівняння
  clearCompare() {
    this.compareList = [];
  }

  // Перевірка чи місце в списку порівняння
  isInCompare(placeId) {
    return this.compareList.some(place => place.id === placeId);
  }

  // Отримання списку для порівняння
  getCompareList() {
    return this.compareList;
  }

  // Отримання кількості місць у порівнянні
  getCompareCount() {
    return this.compareList.length;
  }

  // Генерація детального порівняння
  generateComparison() {
    if (this.compareList.length < 2) {
      return { error: 'Потрібно мінімум 2 місця для порівняння' };
    }

    return {
      places: this.compareList,
      comparison: {
        ratings: this.compareRatings(),
        prices: this.comparePrices(),
        distances: this.compareDistances(),
        workingHours: this.compareWorkingHours(),
        features: this.compareFeatures(),
        reviews: this.compareReviews(),
        recommendations: this.getRecommendations()
      },
      summary: this.generateSummary()
    };
  }

  // Порівняння рейтингів
  compareRatings() {
    const ratings = this.compareList.map(place => ({
      id: place.id,
      name: place.name,
      rating: place.rating,
      isHighest: false,
      isLowest: false
    }));

    const maxRating = Math.max(...ratings.map(r => r.rating));
    const minRating = Math.min(...ratings.map(r => r.rating));

    ratings.forEach(rating => {
      rating.isHighest = rating.rating === maxRating;
      rating.isLowest = rating.rating === minRating && maxRating !== minRating;
    });

    return {
      items: ratings,
      winner: ratings.find(r => r.isHighest),
      analysis: this.analyzeRatings(ratings)
    };
  }

  // Порівняння цін
  comparePrices() {
    const prices = this.compareList.map(place => ({
      id: place.id,
      name: place.name,
      priceLevel: place.priceLevel,
      priceLevelText: this.getPriceLevelText(place.priceLevel),
      isCheapest: false,
      isMostExpensive: false
    }));

    const maxPrice = Math.max(...prices.map(p => p.priceLevel));
    const minPrice = Math.min(...prices.map(p => p.priceLevel));

    prices.forEach(price => {
      price.isCheapest = price.priceLevel === minPrice;
      price.isMostExpensive = price.priceLevel === maxPrice && maxPrice !== minPrice;
    });

    return {
      items: prices,
      cheapest: prices.find(p => p.isCheapest),
      analysis: this.analyzePrices(prices)
    };
  }

  // Порівняння відстаней
  compareDistances() {
    const distances = this.compareList.map(place => ({
      id: place.id,
      name: place.name,
      distance: place.distance,
      distanceText: this.getDistanceText(place.distance),
      isClosest: false,
      isFarthest: false
    }));

    const maxDistance = Math.max(...distances.map(d => d.distance));
    const minDistance = Math.min(...distances.map(d => d.distance));

    distances.forEach(distance => {
      distance.isClosest = distance.distance === minDistance;
      distance.isFarthest = distance.distance === maxDistance && maxDistance !== minDistance;
    });

    return {
      items: distances,
      closest: distances.find(d => d.isClosest),
      analysis: this.analyzeDistances(distances)
    };
  }

  // Порівняння годин роботи
  compareWorkingHours() {
    const now = new Date();
    const currentHour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    return this.compareList.map(place => {
      const hours = place.workingHours || this.getDefaultHours(place.category);
      const todayHours = isWeekend ? hours.weekend : hours.weekday;
      const isOpen = this.isCurrentlyOpen(todayHours, currentHour);

      return {
        id: place.id,
        name: place.name,
        isOpen,
        status: isOpen ? 'Відкрито' : 'Зачинено',
        todayHours: this.formatHours(todayHours),
        nextChange: this.getNextStatusChange(todayHours, currentHour, isOpen)
      };
    });
  }

  // Порівняння особливостей
  compareFeatures() {
    const allFeatures = new Set();
    
    // Збираємо всі можливі особливості
    this.compareList.forEach(place => {
      const features = this.extractFeatures(place);
      features.forEach(feature => allFeatures.add(feature));
    });

    const featureComparison = Array.from(allFeatures).map(feature => ({
      feature,
      places: this.compareList.map(place => ({
        id: place.id,
        name: place.name,
        hasFeature: this.placeHasFeature(place, feature)
      }))
    }));

    return featureComparison;
  }

  // Порівняння відгуків
  compareReviews() {
    return this.compareList.map(place => {
      const reviews = place.reviews || [];
      const recentReviews = reviews.slice(0, 3);
      
      return {
        id: place.id,
        name: place.name,
        totalReviews: reviews.length,
        recentReviews: recentReviews.map(review => ({
          text: review.text?.substring(0, 100) + '...',
          rating: review.rating,
          date: review.date
        })),
        avgRating: place.rating,
        sentiment: this.analyzeSentiment(reviews)
      };
    });
  }

  // Генерація рекомендацій
  getRecommendations() {
    const recommendations = [];

    // Рекомендація за рейтингом
    const bestRated = this.compareList.reduce((best, current) => 
      current.rating > best.rating ? current : best
    );
    recommendations.push({
      type: 'best_rated',
      place: bestRated,
      reason: `Найвищий рейтинг: ${bestRated.rating} ⭐`
    });

    // Рекомендація за ціною
    const cheapest = this.compareList.reduce((cheap, current) => 
      current.priceLevel < cheap.priceLevel ? current : cheap
    );
    recommendations.push({
      type: 'best_value',
      place: cheapest,
      reason: `Найкраща ціна: ${this.getPriceLevelText(cheapest.priceLevel)}`
    });

    // Рекомендація за відстанню
    const closest = this.compareList.reduce((close, current) => 
      current.distance < close.distance ? current : close
    );
    recommendations.push({
      type: 'closest',
      place: closest,
      reason: `Найближче: ${this.getDistanceText(closest.distance)}`
    });

    return recommendations;
  }

  // Генерація підсумку
  generateSummary() {
    const totalPlaces = this.compareList.length;
    const avgRating = this.compareList.reduce((sum, place) => sum + place.rating, 0) / totalPlaces;
    const categories = [...new Set(this.compareList.map(place => place.category))];
    
    return {
      totalPlaces,
      avgRating: Math.round(avgRating * 10) / 10,
      categories,
      priceRange: this.getPriceRange(),
      distanceRange: this.getDistanceRange()
    };
  }

  // Допоміжні методи
  getPriceLevelText(level) {
    const levels = ['Безкоштовно', 'Бюджетно', 'Помірно', 'Дорого', 'Дуже дорого'];
    return levels[level] || 'Невідомо';
  }

  getDistanceText(distance) {
    if (distance < 1000) return `${Math.round(distance)}м`;
    return `${(distance / 1000).toFixed(1)}км`;
  }

  formatHours(hours) {
    if (!hours || hours.start === null) return 'Зачинено';
    return `${hours.start}:00 - ${hours.end}:00`;
  }

  isCurrentlyOpen(hours, currentHour) {
    if (!hours || hours.start === null) return false;
    if (hours.start <= hours.end) {
      return currentHour >= hours.start && currentHour < hours.end;
    } else {
      return currentHour >= hours.start || currentHour < hours.end;
    }
  }

  getDefaultHours(category) {
    const schedules = {
      'Кафе': { weekday: { start: 8, end: 22 }, weekend: { start: 9, end: 23 } },
      'Ресторан': { weekday: { start: 11, end: 23 }, weekend: { start: 11, end: 24 } },
      'Бар': { weekday: { start: 17, end: 2 }, weekend: { start: 17, end: 3 } }
    };
    return schedules[category] || { weekday: { start: 9, end: 18 }, weekend: { start: 10, end: 17 } };
  }

  extractFeatures(place) {
    const features = [];
    if (place.hasWifi) features.push('WiFi');
    if (place.hasParking) features.push('Парковка');
    if (place.petFriendly) features.push('Можна з тваринами');
    if (place.hasDelivery) features.push('Доставка');
    if (place.acceptsCards) features.push('Картки');
    return features;
  }

  placeHasFeature(place, feature) {
    const featureMap = {
      'WiFi': place.hasWifi,
      'Парковка': place.hasParking,
      'Можна з тваринами': place.petFriendly,
      'Доставка': place.hasDelivery,
      'Картки': place.acceptsCards
    };
    return !!featureMap[feature];
  }

  analyzeSentiment(reviews) {
    if (!reviews || reviews.length === 0) return 'neutral';
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    if (avgRating >= 4) return 'positive';
    if (avgRating <= 2) return 'negative';
    return 'neutral';
  }

  analyzeRatings(ratings) {
    const diff = Math.max(...ratings.map(r => r.rating)) - Math.min(...ratings.map(r => r.rating));
    if (diff <= 0.5) return 'Всі місця мають схожі рейтинги';
    if (diff >= 2) return 'Значна різниця в рейтингах';
    return 'Помірна різниця в рейтингах';
  }

  analyzePrices(prices) {
    const diff = Math.max(...prices.map(p => p.priceLevel)) - Math.min(...prices.map(p => p.priceLevel));
    if (diff <= 1) return 'Схожий ціновий діапазон';
    if (diff >= 3) return 'Великий розбіг цін';
    return 'Помірна різниця в цінах';
  }

  analyzeDistances(distances) {
    const maxDist = Math.max(...distances.map(d => d.distance));
    if (maxDist <= 500) return 'Всі місця поруч';
    if (maxDist >= 2000) return 'Місця на різних відстанях';
    return 'Помірна різниця у відстанях';
  }

  getPriceRange() {
    const prices = this.compareList.map(p => p.priceLevel);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? this.getPriceLevelText(min) : 
           `${this.getPriceLevelText(min)} - ${this.getPriceLevelText(max)}`;
  }

  getDistanceRange() {
    const distances = this.compareList.map(p => p.distance);
    const min = Math.min(...distances);
    const max = Math.max(...distances);
    return min === max ? this.getDistanceText(min) : 
           `${this.getDistanceText(min)} - ${this.getDistanceText(max)}`;
  }

  getNextStatusChange(hours, currentHour, isOpen) {
    if (!hours || hours.start === null) return null;
    
    if (isOpen) {
      return `Зачиниться о ${hours.end}:00`;
    } else {
      if (currentHour < hours.start) {
        return `Відкриється о ${hours.start}:00`;
      } else {
        return `Відкриється завтра о ${hours.start}:00`;
      }
    }
  }
}

export default new CompareService();