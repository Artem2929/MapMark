export const loginSchema = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Введіть коректний email'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Пароль має містити мінімум 6 символів'
  }
};

export const validateField = (name, value, schema) => {
  const rules = schema[name];
  if (!rules) return null;

  if (rules.required && !value?.trim()) {
    return rules.message || `${name} обов'язкове поле`;
  }

  if (rules.minLength && value.length < rules.minLength) {
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