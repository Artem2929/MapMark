// Visual Filters Service - Візуальні фільтри настрою
class VisualFiltersService {
  constructor() {
    this.activeFilters = this.loadActiveFilters();
    this.moodFilters = this.initializeMoodFilters();
    this.sliderFilters = this.initializeSliderFilters();
  }

  loadActiveFilters() {
    return JSON.parse(localStorage.getItem('mapmark_visual_filters')) || {
      moods: [],
      sliders: {}
    };
  }

  saveActiveFilters() {
    localStorage.setItem('mapmark_visual_filters', JSON.stringify(this.activeFilters));
  }

  initializeMoodFilters() {
    return [
      {
        id: 'energetic',
        name: 'Енергійно',
        icon: '🔥',
        color: '#ef4444',
        description: 'Жваві, активні місця',
        tags: ['loud', 'crowded', 'party', 'music', 'dancing']
      },
      {
        id: 'calm',
        name: 'Спокійно',
        icon: '🌿',
        color: '#10b981',
        description: 'Тихі, розслаблюючі місця',
        tags: ['quiet', 'peaceful', 'nature', 'meditation', 'reading']
      },
      {
        id: 'work',
        name: 'Для роботи',
        icon: '💼',
        color: '#3b82f6',
        description: 'Місця для продуктивної роботи',
        tags: ['wifi', 'quiet', 'outlets', 'workspace', 'coffee']
      },
      {
        id: 'fun',
        name: 'Весело',
        icon: '🎉',
        color: '#f59e0b',
        description: 'Розважальні місця',
        tags: ['entertainment', 'games', 'social', 'events', 'activities']
      },
      {
        id: 'romantic',
        name: 'Романтично',
        icon: '💕',
        color: '#ec4899',
        description: 'Романтичні місця для побачень',
        tags: ['intimate', 'cozy', 'candlelight', 'couples', 'wine']
      },
      {
        id: 'family',
        name: 'Сімейно',
        icon: '👨‍👩‍👧‍👦',
        color: '#8b5cf6',
        description: 'Місця для сімейного відпочинку',
        tags: ['kids', 'family', 'playground', 'safe', 'spacious']
      }
    ];
  }

  initializeSliderFilters() {
    return [
      {
        id: 'noise_level',
        name: 'Рівень шуму',
        leftLabel: 'Тихо',
        rightLabel: 'Шумно',
        leftIcon: '🤫',
        rightIcon: '📢',
        min: 0,
        max: 100,
        defaultValue: 50,
        color: '#64748b'
      },
      {
        id: 'price_range',
        name: 'Ціновий діапазон',
        leftLabel: 'Бюджетно',
        rightLabel: 'Преміум',
        leftIcon: '💸',
        rightIcon: '💎',
        min: 0,
        max: 100,
        defaultValue: 50,
        color: '#10b981'
      },
      {
        id: 'crowd_level',
        name: 'Завантаженість',
        leftLabel: 'Пусто',
        rightLabel: 'Повно',
        leftIcon: '🏜️',
        rightIcon: '👥',
        min: 0,
        max: 100,
        defaultValue: 50,
        color: '#f59e0b'
      },
      {
        id: 'formality',
        name: 'Формальність',
        leftLabel: 'Casual',
        rightLabel: 'Офіційно',
        leftIcon: '👕',
        rightIcon: '🤵',
        min: 0,
        max: 100,
        defaultValue: 50,
        color: '#8b5cf6'
      }
    ];
  }

  // Встановлення mood фільтрів
  setMoodFilters(moodIds) {
    this.activeFilters.moods = moodIds;
    this.saveActiveFilters();
  }

  // Додавання/видалення mood фільтра
  toggleMoodFilter(moodId) {
    const index = this.activeFilters.moods.indexOf(moodId);
    if (index > -1) {
      this.activeFilters.moods.splice(index, 1);
    } else {
      this.activeFilters.moods.push(moodId);
    }
    this.saveActiveFilters();
  }

  // Встановлення slider фільтра
  setSliderFilter(sliderId, value) {
    this.activeFilters.sliders[sliderId] = value;
    this.saveActiveFilters();
  }

  // Очищення всіх фільтрів
  clearAllFilters() {
    this.activeFilters = { moods: [], sliders: {} };
    this.saveActiveFilters();
  }

  // Отримання активних фільтрів
  getActiveFilters() {
    return this.activeFilters;
  }

  // Отримання mood фільтрів
  getMoodFilters() {
    return this.moodFilters;
  }

  // Отримання slider фільтрів
  getSliderFilters() {
    return this.sliderFilters;
  }

  // Фільтрація місць за активними фільтрами
  filterPlaces(places) {
    if (!places || places.length === 0) return [];

    return places.filter(place => {
      return this.matchesMoodFilters(place) && this.matchesSliderFilters(place);
    }).map(place => ({
      ...place,
      filterScore: this.calculateFilterScore(place)
    })).sort((a, b) => b.filterScore - a.filterScore);
  }

  // Перевірка відповідності mood фільтрам
  matchesMoodFilters(place) {
    if (this.activeFilters.moods.length === 0) return true;

    return this.activeFilters.moods.some(moodId => {
      const mood = this.moodFilters.find(m => m.id === moodId);
      if (!mood) return false;

      return this.placeMatchesMood(place, mood);
    });
  }

  // Перевірка відповідності slider фільтрам
  matchesSliderFilters(place) {
    const sliders = this.activeFilters.sliders;
    
    for (const [sliderId, value] of Object.entries(sliders)) {
      if (!this.placeMatchesSlider(place, sliderId, value)) {
        return false;
      }
    }
    
    return true;
  }

  // Перевірка відповідності місця mood фільтру
  placeMatchesMood(place, mood) {
    const placeTags = this.extractPlaceTags(place);
    const moodTags = mood.tags;
    
    // Перевіряємо чи є перетин між тегами місця та mood
    const intersection = placeTags.filter(tag => moodTags.includes(tag));
    return intersection.length > 0;
  }

  // Перевірка відповідності місця slider фільтру
  placeMatchesSlider(place, sliderId, filterValue) {
    const placeValue = this.getPlaceSliderValue(place, sliderId);
    const tolerance = 25; // Допустиме відхилення
    
    return Math.abs(placeValue - filterValue) <= tolerance;
  }

  // Витягування тегів з місця
  extractPlaceTags(place) {
    const tags = [];
    
    // Теги на основі категорії
    const categoryTags = this.getCategoryTags(place.category);
    tags.push(...categoryTags);
    
    // Теги на основі рейтингу
    if (place.rating >= 4.5) tags.push('high_quality');
    if (place.rating <= 2.5) tags.push('low_quality');
    
    // Теги на основі ціни
    if (place.priceLevel <= 1) tags.push('budget', 'cheap');
    if (place.priceLevel >= 4) tags.push('expensive', 'luxury');
    
    // Теги на основі особливостей
    if (place.hasWifi) tags.push('wifi');
    if (place.hasParking) tags.push('parking');
    if (place.petFriendly) tags.push('pet_friendly');
    if (place.hasMusic) tags.push('music');
    if (place.hasOutdoorSeating) tags.push('outdoor');
    
    // Теги на основі атмосфери (можна розширити)
    if (place.atmosphere) {
      tags.push(...place.atmosphere);
    }
    
    return tags;
  }

  // Отримання тегів для категорії
  getCategoryTags(category) {
    const categoryTagMap = {
      'Кафе': ['coffee', 'casual', 'wifi', 'work'],
      'Ресторан': ['food', 'dining', 'social'],
      'Бар': ['drinks', 'loud', 'party', 'music', 'social'],
      'Парк': ['nature', 'quiet', 'peaceful', 'outdoor', 'family'],
      'Музей': ['quiet', 'educational', 'cultural'],
      'Спортзал': ['energetic', 'active', 'fitness'],
      'Бібліотека': ['quiet', 'work', 'reading', 'peaceful'],
      'Клуб': ['loud', 'party', 'dancing', 'music', 'energetic'],
      'Готель': ['comfortable', 'service'],
      'Магазин': ['shopping', 'busy']
    };
    
    return categoryTagMap[category] || [];
  }

  // Отримання значення slider для місця
  getPlaceSliderValue(place, sliderId) {
    switch (sliderId) {
      case 'noise_level':
        return this.calculateNoiseLevel(place);
      case 'price_range':
        return (place.priceLevel || 2) * 25; // 0-4 -> 0-100
      case 'crowd_level':
        return this.calculateCrowdLevel(place);
      case 'formality':
        return this.calculateFormalityLevel(place);
      default:
        return 50;
    }
  }

  // Розрахунок рівня шуму
  calculateNoiseLevel(place) {
    let noise = 50; // базовий рівень
    
    const category = place.category;
    if (['Бар', 'Клуб'].includes(category)) noise += 30;
    if (['Кафе', 'Ресторан'].includes(category)) noise += 10;
    if (['Парк', 'Бібліотека', 'Музей'].includes(category)) noise -= 30;
    
    if (place.hasMusic) noise += 20;
    if (place.hasOutdoorSeating) noise -= 10;
    
    return Math.max(0, Math.min(100, noise));
  }

  // Розрахунок рівня завантаженості
  calculateCrowdLevel(place) {
    let crowd = 50;
    
    if (place.rating >= 4.5) crowd += 20; // популярні місця більш завантажені
    if (place.priceLevel <= 1) crowd += 15; // дешеві місця більш завантажені
    if (place.priceLevel >= 4) crowd -= 15; // дорогі місця менш завантажені
    
    const category = place.category;
    if (['Клуб', 'Бар'].includes(category)) crowd += 25;
    if (['Парк', 'Музей'].includes(category)) crowd -= 15;
    
    return Math.max(0, Math.min(100, crowd));
  }

  // Розрахунок рівня формальності
  calculateFormalityLevel(place) {
    let formality = 50;
    
    if (place.priceLevel >= 4) formality += 30;
    if (place.priceLevel <= 1) formality -= 20;
    
    const category = place.category;
    if (['Готель', 'Ресторан'].includes(category)) formality += 15;
    if (['Бар', 'Кафе', 'Парк'].includes(category)) formality -= 15;
    if (category === 'Клуб') formality -= 25;
    
    return Math.max(0, Math.min(100, formality));
  }

  // Розрахунок загального скору відповідності фільтрам
  calculateFilterScore(place) {
    let score = 0;
    let totalWeight = 0;
    
    // Скор за mood фільтрами
    if (this.activeFilters.moods.length > 0) {
      const moodScore = this.calculateMoodScore(place);
      score += moodScore * 0.6;
      totalWeight += 0.6;
    }
    
    // Скор за slider фільтрами
    const sliderScore = this.calculateSliderScore(place);
    score += sliderScore * 0.4;
    totalWeight += 0.4;
    
    return totalWeight > 0 ? score / totalWeight : 0;
  }

  // Розрахунок скору за mood фільтрами
  calculateMoodScore(place) {
    if (this.activeFilters.moods.length === 0) return 100;
    
    const placeTags = this.extractPlaceTags(place);
    let totalScore = 0;
    
    this.activeFilters.moods.forEach(moodId => {
      const mood = this.moodFilters.find(m => m.id === moodId);
      if (mood) {
        const matchingTags = placeTags.filter(tag => mood.tags.includes(tag));
        const moodScore = (matchingTags.length / mood.tags.length) * 100;
        totalScore += moodScore;
      }
    });
    
    return totalScore / this.activeFilters.moods.length;
  }

  // Розрахунок скору за slider фільтрами
  calculateSliderScore(place) {
    const sliders = this.activeFilters.sliders;
    if (Object.keys(sliders).length === 0) return 100;
    
    let totalScore = 0;
    let count = 0;
    
    for (const [sliderId, filterValue] of Object.entries(sliders)) {
      const placeValue = this.getPlaceSliderValue(place, sliderId);
      const difference = Math.abs(placeValue - filterValue);
      const score = Math.max(0, 100 - difference);
      totalScore += score;
      count++;
    }
    
    return count > 0 ? totalScore / count : 100;
  }

  // Отримання кольорового кодування для місця
  getPlaceColorCoding(place) {
    const activeMoods = this.activeFilters.moods;
    if (activeMoods.length === 0) return '#64748b'; // default color
    
    // Повертаємо колір першого відповідного mood
    for (const moodId of activeMoods) {
      const mood = this.moodFilters.find(m => m.id === moodId);
      if (mood && this.placeMatchesMood(place, mood)) {
        return mood.color;
      }
    }
    
    return '#64748b';
  }

  // Отримання статистики фільтрації
  getFilterStats(originalPlaces, filteredPlaces) {
    return {
      total: originalPlaces.length,
      filtered: filteredPlaces.length,
      percentage: originalPlaces.length > 0 ? 
        Math.round((filteredPlaces.length / originalPlaces.length) * 100) : 0,
      activeMoods: this.activeFilters.moods.length,
      activeSliders: Object.keys(this.activeFilters.sliders).length
    };
  }

  // Отримання рекомендованих фільтрів на основі поточного часу
  getRecommendedFilters() {
    const hour = new Date().getHours();
    const recommendations = [];
    
    if (hour >= 7 && hour <= 11) {
      recommendations.push({
        type: 'mood',
        id: 'work',
        reason: 'Ранковий час - ідеально для роботи'
      });
    } else if (hour >= 12 && hour <= 14) {
      recommendations.push({
        type: 'mood',
        id: 'calm',
        reason: 'Обідній час - час для спокійного відпочинку'
      });
    } else if (hour >= 18 && hour <= 22) {
      recommendations.push({
        type: 'mood',
        id: 'fun',
        reason: 'Вечірній час - час для розваг'
      });
    }
    
    return recommendations;
  }
}

export default new VisualFiltersService();