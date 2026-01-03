// Validation utilities for forms

export const validators = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? null : 'Невірний формат email'
  },

  password: (value) => {
    if (!value || value.length < 8) {
      return 'Пароль має містити мінімум 8 символів'
    }
    if (!/[A-Z]/.test(value)) {
      return 'Пароль має містити велику літеру'
    }
    if (!/[a-z]/.test(value)) {
      return 'Пароль має містити малу літеру'
    }
    if (!/[0-9]/.test(value)) {
      return 'Пароль має містити цифру'
    }
    return null
  },

  username: (value) => {
    if (!value || value.length < 3) {
      return 'Ім\'я користувача має містити мінімум 3 символи'
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Тільки літери, цифри та підкреслення'
    }
    return null
  },

  required: (value) => {
    return value && value.trim() ? null : 'Це поле обов\'язкове'
  },

  minLength: (min) => (value) => {
    return value && value.length >= min ? null : `Мінімум ${min} символів`
  },

  maxLength: (max) => (value) => {
    return value && value.length <= max ? null : `Максимум ${max} символів`
  },

  phone: (value) => {
    const phoneRegex = /^\+?[0-9]{10,15}$/
    return phoneRegex.test(value) ? null : 'Невірний формат телефону'
  },

  url: (value) => {
    try {
      new URL(value)
      return null
    } catch {
      return 'Невірний формат URL'
    }
  }
}

export const validateForm = (values, rules) => {
  const errors = {}
  
  Object.keys(rules).forEach(field => {
    const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]]
    
    for (const rule of fieldRules) {
      const error = rule(values[field])
      if (error) {
        errors[field] = error
        break
      }
    }
  })
  
  return errors
}

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .slice(0, 1000) // Limit length
}
