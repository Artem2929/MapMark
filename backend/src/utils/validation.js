const validator = require('validator')

const VALIDATION_RULES = {
  NAME_MIN: 2,
  NAME_MAX: 50,
  BIO_MAX: 500,
  POSITION_MAX: 100,
  LOCATION_MAX: 100,
  PASSWORD_MIN: 6,
  MIN_AGE: 13,
  MAX_AGE: 120
}

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  return validator.escape(validator.trim(input))
}

const validateName = (name) => {
  if (!name || !validator.isLength(name, { min: VALIDATION_RULES.NAME_MIN })) {
    return { valid: false, error: `Ім'я повинно містити мінімум ${VALIDATION_RULES.NAME_MIN} символи` }
  }
  
  if (!validator.isLength(name, { max: VALIDATION_RULES.NAME_MAX })) {
    return { valid: false, error: `Ім'я не може перевищувати ${VALIDATION_RULES.NAME_MAX} символів` }
  }
  
  return { valid: true }
}

const validateEmail = (email) => {
  if (!email || !validator.isEmail(email)) {
    return { valid: false, error: 'Некоректний email' }
  }
  
  return { valid: true }
}

const validatePassword = (password) => {
  if (!password || !validator.isLength(password, { min: VALIDATION_RULES.PASSWORD_MIN })) {
    return { valid: false, error: `Пароль повинен містити мінімум ${VALIDATION_RULES.PASSWORD_MIN} символів` }
  }
  
  return { valid: true }
}

const validateBirthDate = (birthDate) => {
  if (!birthDate) return { valid: true }
  
  const date = new Date(birthDate)
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Некоректна дата' }
  }
  
  const age = new Date().getFullYear() - date.getFullYear()
  
  if (age < VALIDATION_RULES.MIN_AGE) {
    return { valid: false, error: `Вік повинен бути не менше ${VALIDATION_RULES.MIN_AGE} років` }
  }
  
  if (age > VALIDATION_RULES.MAX_AGE) {
    return { valid: false, error: 'Некоректна дата народження' }
  }
  
  return { valid: true }
}

const validateBio = (bio) => {
  if (!bio) return { valid: true }
  
  if (!validator.isLength(bio, { max: VALIDATION_RULES.BIO_MAX })) {
    return { valid: false, error: `Опис не може перевищувати ${VALIDATION_RULES.BIO_MAX} символів` }
  }
  
  return { valid: true }
}

const validatePosition = (position) => {
  if (!position) return { valid: true }
  
  if (!validator.isLength(position, { max: VALIDATION_RULES.POSITION_MAX })) {
    return { valid: false, error: `Посада не може перевищувати ${VALIDATION_RULES.POSITION_MAX} символів` }
  }
  
  return { valid: true }
}

const validateLocation = (location) => {
  if (!location) return { valid: true }
  
  if (!validator.isLength(location, { max: VALIDATION_RULES.LOCATION_MAX })) {
    return { valid: false, error: `Місцезнаходження не може перевищувати ${VALIDATION_RULES.LOCATION_MAX} символів` }
  }
  
  return { valid: true }
}

const validateProfileUpdate = (data) => {
  const errors = {}
  
  if (data.name !== undefined) {
    const result = validateName(data.name)
    if (!result.valid) errors.name = result.error
  }
  
  if (data.email !== undefined) {
    const result = validateEmail(data.email)
    if (!result.valid) errors.email = result.error
  }
  
  if (data.birthDate !== undefined) {
    const result = validateBirthDate(data.birthDate)
    if (!result.valid) errors.birthDate = result.error
  }
  
  if (data.bio !== undefined) {
    const result = validateBio(data.bio)
    if (!result.valid) errors.bio = result.error
  }
  
  if (data.position !== undefined) {
    const result = validatePosition(data.position)
    if (!result.valid) errors.position = result.error
  }
  
  if (data.location !== undefined) {
    const result = validateLocation(data.location)
    if (!result.valid) errors.location = result.error
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

module.exports = {
  VALIDATION_RULES,
  sanitizeInput,
  validateName,
  validateEmail,
  validatePassword,
  validateBirthDate,
  validateBio,
  validatePosition,
  validateLocation,
  validateProfileUpdate
}
