export const aboutSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Ім\'я має містити від 2 до 50 символів'
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Введіть коректний email'
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 1000,
    message: 'Повідомлення має містити від 10 до 1000 символів'
  }
};

export const validateField = (name, value, schema) => {
  const rules = schema[name];
  if (!rules) return null;

  if (rules.required && !value?.toString().trim()) {
    return rules.message || `${name} обов'язкове поле`;
  }

  if (rules.minLength && value.length < rules.minLength) {
    return rules.message;
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return rules.message;
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return rules.message;
  }

  return null;
};

export const validateForm = (data, schema) => {
  const errors = {};
  let isValid = true;

  Object.keys(schema).forEach(field => {
    const error = validateField(field, data[field], schema);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  });

  return { errors, isValid };
};