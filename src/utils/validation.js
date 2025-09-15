/**
 * Validation utilities
 */

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate required field
 * @param {any} value 
 * @returns {boolean}
 */
export const isRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};

/**
 * Validate minimum length
 * @param {string} value 
 * @param {number} minLength 
 * @returns {boolean}
 */
export const hasMinLength = (value, minLength) => {
  return typeof value === 'string' && value.length >= minLength;
};

/**
 * Validate coordinates
 * @param {number} lat 
 * @param {number} lon 
 * @returns {boolean}
 */
export const isValidCoordinates = (lat, lon) => {
  return (
    typeof lat === 'number' && 
    typeof lon === 'number' &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180
  );
};

/**
 * Validate file type for images
 * @param {File} file 
 * @returns {boolean}
 */
export const isValidImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return file && allowedTypes.includes(file.type);
};

/**
 * Validate file size (in MB)
 * @param {File} file 
 * @param {number} maxSizeMB 
 * @returns {boolean}
 */
export const isValidFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file && file.size <= maxSizeBytes;
};