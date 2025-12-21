export const registerSchema = {
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
  password: {
    required: true,
    minLength: 6,
    message: 'Пароль має містити мінімум 6 символів'
  },
  confirmPassword: {
    required: true,
    match: 'password',
    message: 'Паролі не співпадають'
  },
  country: {
    required: true,
    message: 'Оберіть країну'
  },
  role: {
    required: true,
    message: 'Оберіть роль'
  },
  acceptTerms: {
    required: true,
    value: true,
    message: 'Прийміть умови використання'
  },
  acceptPrivacy: {
    required: true,
    value: true,
    message: 'Прийміть політику конфіденційності'
  }
};

export const validateField = (name, value, schema, formData = {}) => {
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

  if (rules.match && value !== formData[rules.match]) {
    return rules.message;
  }

  if (rules.value !== undefined && value !== rules.value) {
    return rules.message;
  }

  return null;
};

export const validateForm = (data, schema) => {
  const errors = {};
  let isValid = true;

  Object.keys(schema).forEach(field => {
    const error = validateField(field, data[field], schema, data);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  });

  return { errors, isValid };
};