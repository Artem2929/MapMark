// Validation utilities
const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 500,
  POSITION_MAX_LENGTH: 100,
  LOCATION_MAX_LENGTH: 100,
  WEBSITE_MAX_LENGTH: 100,
  MIN_AGE: 13,
  MAX_AGE: 120
}

const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  WEBSITE: /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i,
  URL_PROTOCOL: /^https?:\/\//
}

export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { valid: false, error: "Ім'я обов'язкове" }
  }
  
  if (name.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
    return { valid: false, error: `Ім'я повинно містити мінімум ${VALIDATION_RULES.NAME_MIN_LENGTH} символи` }
  }
  
  if (name.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
    return { valid: false, error: `Ім'я не може перевищувати ${VALIDATION_RULES.NAME_MAX_LENGTH} символів` }
  }
  
  return { valid: true }
}

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { valid: true } // Email optional
  }
  
  if (!REGEX.EMAIL.test(email)) {
    return { valid: false, error: 'Введіть коректний email' }
  }
  
  return { valid: true }
}

export const validateBirthDate = (birthDate) => {
  if (!birthDate) {
    return { valid: true } // Optional
  }
  
  const date = new Date(birthDate)
  const today = new Date()
  
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Некоректна дата' }
  }
  
  const age = today.getFullYear() - date.getFullYear()
  
  if (age < VALIDATION_RULES.MIN_AGE) {
    return { valid: false, error: `Вік повинен бути не менше ${VALIDATION_RULES.MIN_AGE} років` }
  }
  
  if (age > VALIDATION_RULES.MAX_AGE) {
    return { valid: false, error: 'Некоректна дата народження' }
  }
  
  return { valid: true }
}

export const validateBio = (bio) => {
  if (!bio) {
    return { valid: true } // Optional
  }
  
  if (bio.length > VALIDATION_RULES.BIO_MAX_LENGTH) {
    return { valid: false, error: `Опис не може перевищувати ${VALIDATION_RULES.BIO_MAX_LENGTH} символів` }
  }
  
  return { valid: true }
}

export const validateWebsite = (website) => {
  if (!website || !website.trim()) {
    return { valid: true } // Optional
  }
  
  if (!REGEX.WEBSITE.test(website)) {
    return { valid: false, error: 'Введіть коректний веб-сайт (наприклад: example.com або https://example.com)' }
  }
  
  return { valid: true }
}

export const validatePosition = (position) => {
  if (!position) {
    return { valid: true } // Optional
  }
  
  if (position.length > VALIDATION_RULES.POSITION_MAX_LENGTH) {
    return { valid: false, error: `Посада не може перевищувати ${VALIDATION_RULES.POSITION_MAX_LENGTH} символів` }
  }
  
  return { valid: true }
}

export const validateLocation = (location) => {
  if (!location) {
    return { valid: true } // Optional
  }
  
  if (location.length > VALIDATION_RULES.LOCATION_MAX_LENGTH) {
    return { valid: false, error: `Місцезнаходження не може перевищувати ${VALIDATION_RULES.LOCATION_MAX_LENGTH} символів` }
  }
  
  return { valid: true }
}

export const normalizeWebsite = (website) => {
  if (!website || !website.trim()) {
    return ''
  }
  
  return REGEX.URL_PROTOCOL.test(website) ? website : `https://${website}`
}

export const validateProfileForm = (formData) => {
  const errors = {}
  
  const nameValidation = validateName(formData.name)
  if (!nameValidation.valid) {
    errors.name = nameValidation.error
  }
  
  const emailValidation = validateEmail(formData.email)
  if (!emailValidation.valid) {
    errors.email = emailValidation.error
  }
  
  const birthDateValidation = validateBirthDate(formData.birthDate)
  if (!birthDateValidation.valid) {
    errors.birthDate = birthDateValidation.error
  }
  
  const bioValidation = validateBio(formData.bio)
  if (!bioValidation.valid) {
    errors.bio = bioValidation.error
  }
  
  const websiteValidation = validateWebsite(formData.website)
  if (!websiteValidation.valid) {
    errors.website = websiteValidation.error
  }
  
  const positionValidation = validatePosition(formData.position)
  if (!positionValidation.valid) {
    errors.position = positionValidation.error
  }
  
  const locationValidation = validateLocation(formData.location)
  if (!locationValidation.valid) {
    errors.location = locationValidation.error
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
