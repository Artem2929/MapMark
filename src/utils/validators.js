const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CYRILLIC_REGEX = /[а-яё]/i

export const validators = {
  required: (value, message = "Поле обов'язкове") => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message
    }
    return null
  },

  email: (value, message = 'Невірний формат email') => {
    if (!value) return null
    return !EMAIL_REGEX.test(value) ? message : null
  },

  minLength: (min, message) => (value) => {
    if (!value) return null
    if ((typeof value === 'string' || Array.isArray(value)) && value.length < min) {
      return message || `Мінімум ${min} символів`
    }
    return null
  },

  containsCyrillic: (value) => {
    if (value && CYRILLIC_REGEX.test(value)) {
      return 'Лише латинські символи'
    }
    return null
  }
}

export function validateField(value, validatorsList) {
  if (!Array.isArray(validatorsList)) {
    return null
  }
  
  for (const validator of validatorsList) {
    if (typeof validator === 'function') {
      const error = validator(value)
      if (error) return error
    }
  }
  return null
}