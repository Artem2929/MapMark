// AI Service for MapMark - Voice, Photo Analysis, Smart Recommendations
class AIService {
  constructor() {
    this.speechRecognition = null;
    this.isListening = false;
    this.initSpeechRecognition();
  }

  // Voice Recognition & Transcription
  initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = 'uk-UA';
    }
  }

  async startVoiceRecording(onResult, onError) {
    if (!this.speechRecognition) {
      onError('Voice recognition not supported');
      return;
    }

    this.isListening = true;
    this.speechRecognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      onResult(transcript);
    };

    this.speechRecognition.onerror = onError;
    this.speechRecognition.start();
  }

  stopVoiceRecording() {
    if (this.speechRecognition && this.isListening) {
      this.speechRecognition.stop();
      this.isListening = false;
    }
  }

  // Photo Analysis using AI
  async analyzePhoto(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      // Mock AI analysis - replace with actual AI service
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            objects: ['cafe', 'people', 'food'],
            mood: 'cozy',
            quality: 8.5,
            tags: ['instagram-worthy', 'good-lighting', 'crowded'],
            suggestedCategories: ['Кафе', 'Ресторан'],
            accessibility: {
              wheelchairAccessible: true,
              hasParking: false
            }
          });
        }, 1500);
      });
    } catch (error) {
      throw new Error('Photo analysis failed');
    }
  }

  // Smart Review Analysis
  async analyzeReviewSentiment(text) {
    const positiveWords = ['чудово', 'відмінно', 'класно', 'супер', 'круто', 'рекомендую'];
    const negativeWords = ['погано', 'жахливо', 'не рекомендую', 'розчарування'];
    
    const words = text.toLowerCase().split(' ');
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });

    return {
      sentiment: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral',
      score: Math.max(0, Math.min(10, 5 + score)),
      keywords: words.filter(word => [...positiveWords, ...negativeWords].includes(word))
    };
  }

  // Smart Location Recommendations
  async getSmartRecommendations(userPreferences, location, timeOfDay) {
    const recommendations = {
      morning: ['Кафе', 'Пекарня', 'Парк'],
      afternoon: ['Ресторан', 'Музей', 'Торговий центр'],
      evening: ['Бар', 'Ресторан', 'Кінотеатр'],
      night: ['Нічний клуб', 'Бар', '24/7 заклад']
    };

    const timeSlot = this.getTimeSlot(timeOfDay);
    const suggested = recommendations[timeSlot] || recommendations.afternoon;

    return {
      categories: suggested,
      reasoning: `Рекомендації для ${timeSlot} часу`,
      personalizedScore: Math.random() * 10
    };
  }

  getTimeSlot(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  // Auto-translate reviews
  async translateText(text, targetLang = 'uk') {
    // Mock translation - replace with actual service
    const translations = {
      'en': {
        'Чудове місце': 'Great place',
        'Рекомендую': 'Recommend'
      }
    };

    return translations[targetLang]?.[text] || text;
  }
}

export default new AIService();