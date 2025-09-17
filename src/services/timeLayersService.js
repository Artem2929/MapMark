// Time Layers Service - Часові шари карти
class TimeLayersService {
  constructor() {
    this.currentLayer = 'now';
    this.layers = this.initializeLayers();
  }

  initializeLayers() {
    return {
      now: {
        id: 'now',
        name: 'Зараз',
        icon: '🕐',
        color: '#3b82f6',
        description: 'Поточний стан місць'
      },
      morning: {
        id: 'morning',
        name: 'Ранок',
        icon: '🌅',
        color: '#f59e0b',
        description: '6:00 - 12:00',
        timeRange: { start: 6, end: 12 }
      },
      afternoon: {
        id: 'afternoon',
        name: 'День',
        icon: '☀️',
        color: '#10b981',
        description: '12:00 - 18:00',
        timeRange: { start: 12, end: 18 }
      },
      evening: {
        id: 'evening',
        name: 'Вечір',
        icon: '🌆',
        color: '#8b5cf6',
        description: '18:00 - 24:00',
        timeRange: { start: 18, end: 24 }
      },
      weekend: {
        id: 'weekend',
        name: 'Вихідні',
        icon: '🎉',
        color: '#ef4444',
        description: 'Субота та неділя'
      }
    };
  }

  // Встановлення активного шару
  setActiveLayer(layerId) {
    if (this.layers[layerId]) {
      this.currentLayer = layerId;
      return true;
    }
    return false;
  }

  // Отримання активного шару
  getActiveLayer() {
    return this.layers[this.currentLayer];
  }

  // Отримання всіх шарів
  getAllLayers() {
    return Object.values(this.layers);
  }

  // Фільтрація місць за активним шаром
  filterPlacesByLayer(places, layerId = this.currentLayer) {
    const layer = this.layers[layerId];
    if (!layer) return places;

    return places.map(place => ({
      ...place,
      layerData: this.getPlaceLayerData(place, layer)
    })).filter(place => place.layerData.isAvailable);
  }

  // Отримання даних місця для конкретного шару
  getPlaceLayerData(place, layer) {
    const now = new Date();
    const currentHour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    switch (layer.id) {
      case 'now':
        return this.getCurrentLayerData(place, currentHour, isWeekend);
      
      case 'morning':
      case 'afternoon':
      case 'evening':
        return this.getTimeRangeLayerData(place, layer.timeRange);
      
      case 'weekend':
        return this.getWeekendLayerData(place);
      
      default:
        return { isAvailable: true, status: 'unknown' };
    }
  }

  getCurrentLayerData(place, currentHour, isWeekend) {
    const workingHours = place.workingHours || this.getDefaultWorkingHours(place.category);
    const todayHours = isWeekend ? workingHours.weekend : workingHours.weekday;
    
    const isOpen = this.isPlaceOpen(todayHours, currentHour);
    const crowdLevel = this.getCrowdLevel(place, currentHour, isWeekend);
    
    return {
      isAvailable: true,
      isOpen,
      status: isOpen ? 'open' : 'closed',
      crowdLevel,
      specialOffers: this.getSpecialOffers(place, currentHour, isWeekend),
      nextOpenTime: isOpen ? null : this.getNextOpenTime(place, currentHour, isWeekend)
    };
  }

  getTimeRangeLayerData(place, timeRange) {
    const workingHours = place.workingHours || this.getDefaultWorkingHours(place.category);
    const isUsuallyOpen = this.isUsuallyOpenInRange(workingHours, timeRange);
    const avgCrowdLevel = this.getAverageCrowdLevel(place, timeRange);
    
    return {
      isAvailable: isUsuallyOpen,
      status: isUsuallyOpen ? 'usually_open' : 'usually_closed',
      crowdLevel: avgCrowdLevel,
      recommendation: this.getTimeRecommendation(place, timeRange)
    };
  }

  getWeekendLayerData(place) {
    const workingHours = place.workingHours || this.getDefaultWorkingHours(place.category);
    const isOpenWeekends = workingHours.weekend && workingHours.weekend.start !== null;
    
    return {
      isAvailable: isOpenWeekends,
      status: isOpenWeekends ? 'weekend_open' : 'weekend_closed',
      crowdLevel: this.getWeekendCrowdLevel(place),
      weekendSpecials: this.getWeekendSpecials(place)
    };
  }

  // Перевірка чи місце відкрите
  isPlaceOpen(hours, currentHour) {
    if (!hours || hours.start === null || hours.end === null) return false;
    
    if (hours.start <= hours.end) {
      return currentHour >= hours.start && currentHour < hours.end;
    } else {
      // Працює через північ
      return currentHour >= hours.start || currentHour < hours.end;
    }
  }

  // Отримання рівня завантаженості
  getCrowdLevel(place, hour, isWeekend) {
    // Симуляція на основі типу місця та часу
    const baseLevel = place.popularTimes?.[hour] || Math.random();
    const weekendMultiplier = isWeekend ? 1.3 : 1;
    const level = Math.min(1, baseLevel * weekendMultiplier);
    
    if (level < 0.3) return 'low';
    if (level < 0.7) return 'medium';
    return 'high';
  }

  // Отримання спеціальних пропозицій
  getSpecialOffers(place, hour, isWeekend) {
    const offers = [];
    
    // Happy hour
    if (place.category === 'Бар' && hour >= 17 && hour <= 19) {
      offers.push({ type: 'happy_hour', text: 'Happy Hour до 19:00' });
    }
    
    // Сніданок
    if (place.category === 'Кафе' && hour >= 7 && hour <= 11) {
      offers.push({ type: 'breakfast', text: 'Спеціальне меню сніданків' });
    }
    
    // Вихідні знижки
    if (isWeekend && Math.random() > 0.7) {
      offers.push({ type: 'weekend_discount', text: 'Знижка 10% у вихідні' });
    }
    
    return offers;
  }

  // Отримання стандартних годин роботи
  getDefaultWorkingHours(category) {
    const schedules = {
      'Кафе': {
        weekday: { start: 8, end: 22 },
        weekend: { start: 9, end: 23 }
      },
      'Ресторан': {
        weekday: { start: 11, end: 23 },
        weekend: { start: 11, end: 24 }
      },
      'Бар': {
        weekday: { start: 17, end: 2 },
        weekend: { start: 17, end: 3 }
      },
      'Парк': {
        weekday: { start: 6, end: 22 },
        weekend: { start: 6, end: 22 }
      },
      'Магазин': {
        weekday: { start: 9, end: 21 },
        weekend: { start: 10, end: 20 }
      }
    };
    
    return schedules[category] || {
      weekday: { start: 9, end: 18 },
      weekend: { start: 10, end: 17 }
    };
  }

  // Отримання наступного часу відкриття
  getNextOpenTime(place, currentHour, isWeekend) {
    const workingHours = place.workingHours || this.getDefaultWorkingHours(place.category);
    const todayHours = isWeekend ? workingHours.weekend : workingHours.weekday;
    
    if (currentHour < todayHours.start) {
      return `Відкриється о ${todayHours.start}:00`;
    } else {
      const tomorrowHours = isWeekend ? workingHours.weekday : workingHours.weekend;
      return `Відкриється завтра о ${tomorrowHours.start}:00`;
    }
  }

  // Перевірка чи зазвичай відкрито в діапазоні
  isUsuallyOpenInRange(workingHours, timeRange) {
    const weekdayOverlap = this.hasTimeOverlap(workingHours.weekday, timeRange);
    const weekendOverlap = this.hasTimeOverlap(workingHours.weekend, timeRange);
    return weekdayOverlap || weekendOverlap;
  }

  hasTimeOverlap(hours, range) {
    if (!hours || hours.start === null) return false;
    return !(hours.end <= range.start || hours.start >= range.end);
  }

  // Отримання рекомендації для часового діапазону
  getTimeRecommendation(place, timeRange) {
    const recommendations = {
      morning: 'Ідеально для сніданку та ранкової кави',
      afternoon: 'Чудовий час для обіду та роботи',
      evening: 'Відмінно для вечері та відпочинку'
    };
    
    return recommendations[timeRange.id] || 'Гарний час для відвідування';
  }

  getAverageCrowdLevel(place, timeRange) {
    // Симуляція середнього рівня завантаженості
    const levels = ['low', 'medium', 'high'];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  getWeekendCrowdLevel(place) {
    // Вихідні зазвичай більш завантажені
    const levels = ['medium', 'high'];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  getWeekendSpecials(place) {
    const specials = [
      'Спеціальне вихідне меню',
      'Жива музика по суботах',
      'Дитяче меню у вихідні',
      'Подовжений час роботи'
    ];
    
    return Math.random() > 0.5 ? [specials[Math.floor(Math.random() * specials.length)]] : [];
  }
}

export default new TimeLayersService();