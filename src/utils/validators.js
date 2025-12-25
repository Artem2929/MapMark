export const validators = {
  required: (value, message = "Поле обов'язкове") => {
    return !value?.trim() ? message : null
  },

  email: (value, message = 'Невірний формат email') => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !emailRegex.test(value) ? message : null
  },

  minLength: (min, message) => (value) => {
    if (!value) return null
    return value.length < min ? message || `Мінімум ${min} символів` : null
  }
}

export function validateField(value, validatorsList) {
  for (const validator of validatorsList) {
    const error = validator(value)
    if (error) return error
  }
  return null
}