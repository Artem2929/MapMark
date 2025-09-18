// App constants
export const APP_NAME = 'MapMark';

// API endpoints
export const API_ENDPOINTS = {
  GEOCODING: 'https://nominatim.openstreetmap.org/search',
  BACKEND: 'http://localhost:3000/api',
  REVIEWS: 'http://localhost:3000/api/reviews',
  REVIEW: 'http://localhost:3000/api/review',
};

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ua', name: 'Українська', flag: '🇺🇦' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

// Ad categories
export const AD_CATEGORIES = [
  'housing',
  'cars', 
  'restaurants',
  'hotels',
  'events',
  'tourism',
  'services',
  'other'
];

// Countries list
export const COUNTRIES = [
  'Ukraine', 'United States', 'Germany', 'France', 'Spain', 'Italy', 
  'United Kingdom', 'Poland', 'Canada', 'Australia', 'Japan', 'China'
];