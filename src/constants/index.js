// Application constants

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'mapmark-theme',
  USER_PREFERENCES: 'mapmark-user-preferences',
  RECENT_SEARCHES: 'mapmark-recent-searches',
  BOOKMARKS: 'mapmark-bookmarks',
  LANGUAGE: 'mapmark-language',
};

// API endpoints (when backend is implemented)
export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  AUTH: '/auth',
  USERS: '/users',
  PLACES: '/places',
  REVIEWS: '/reviews',
  SEARCH: '/search',
  COUNTRIES: '/countries',
};

// Map configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [50.4501, 30.5234], // Kyiv coordinates
  DEFAULT_ZOOM: 10,
  MIN_ZOOM: 2,
  MAX_ZOOM: 18,
  TILE_LAYER: import.meta.env.VITE_MAP_TILE_LAYER || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: import.meta.env.VITE_MAP_ATTRIBUTION || '© OpenStreetMap contributors',
};

// Breakpoints (should match CSS variables)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Form validation
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  REVIEW_MIN_LENGTH: 10,
  REVIEW_MAX_LENGTH: 1000,
};

// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 5,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
};

// Rating system
export const RATING = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 3,
};

// Categories for places
export const PLACE_CATEGORIES = {
  RESTAURANT: 'restaurant',
  HOTEL: 'hotel',
  ATTRACTION: 'attraction',
  SHOPPING: 'shopping',
  ENTERTAINMENT: 'entertainment',
  TRANSPORT: 'transport',
  HEALTHCARE: 'healthcare',
  EDUCATION: 'education',
  OTHER: 'other',
};

// Status constants
export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  REVIEW_CREATED: 'Review created successfully!',
  REVIEW_UPDATED: 'Review updated successfully!',
  REVIEW_DELETED: 'Review deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  BOOKMARK_ADDED: 'Place bookmarked!',
  BOOKMARK_REMOVED: 'Bookmark removed!',
};

// Component sizes
export const SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
};

// Button variants
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  OUTLINE: 'outline',
  GHOST: 'ghost',
  DANGER: 'danger',
};

// Modal sizes
export const MODAL_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  FULL: 'full',
};

// Z-index layers (should match CSS variables)
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
};