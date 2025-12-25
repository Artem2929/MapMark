// Чисті функції валідації
export const validators = {
  required: (value, message = 'Поле обов\'язкове') => {
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
  },

  noCyrillic: (value, message = 'Кирилиця не дозволена') => {
    if (!value) return null
    const cyrillicRegex = /[а-яё]/i
    return cyrillicRegex.test(value) ? message : null
  }
}

// Композиція валідаторів
export function validateField(value, validatorsList) {
  for (const validator of validatorsList) {
    const error = validator(value)
    if (error) return error
  }
  return null
}

// Схеми валідації для форм
export const loginSchema = {
  email: [
    validators.required,
    validators.email,
    validators.noCyrillic
  ],
  password: [
    validators.required,
    validators.minLength(6)
  ]
}