import { useState, useEffect } from 'react';

const validationRules = {
  firstName: [
    { validator: (v) => v.length >= 2, message: 'Мінімум 2 символи' },
    { validator: (v) => v.length <= 50, message: 'Максимум 50 символів' },
    { validator: (v) => /^[а-яА-ЯіІїЇєЄa-zA-Z\s'-]+$/.test(v), message: 'Тільки літери, пробіли та дефіси' }
  ],
  lastName: [
    { validator: (v) => v.length >= 2, message: 'Мінімум 2 символи' },
    { validator: (v) => v.length <= 50, message: 'Максимум 50 символів' },
    { validator: (v) => /^[а-яА-ЯіІїЇєЄa-zA-Z\s'-]+$/.test(v), message: 'Тільки літери, пробіли та дефіси' }
  ],
  birthCity: [
    { validator: (v) => v.length >= 2, message: 'Мінімум 2 символи' },
    { validator: (v) => v.length <= 100, message: 'Максимум 100 символів' },
    { validator: (v) => /^[а-яА-ЯіІїЇєЄa-zA-Z\s'-]+$/.test(v), message: 'Тільки літери, пробіли та дефіси' }
  ],
  about: [
    { validator: (v) => v.length <= 200, message: 'Максимум 200 символів' },
    { validator: (v) => v.trim().length > 0 || v.length === 0, message: 'Не може містити тільки пробіли' }
  ]
};

export const useRealTimeValidation = (fieldName, value) => {
  const [errors, setErrors] = useState([]);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (!value || value.trim() === '') {
      setErrors([]);
      setIsValid(true);
      return;
    }

    const rules = validationRules[fieldName] || [];
    const newErrors = [];

    rules.forEach(rule => {
      if (!rule.validator(value)) {
        newErrors.push(rule.message);
      }
    });

    setErrors(newErrors);
    setIsValid(newErrors.length === 0);
  }, [fieldName, value]);

  return { errors, isValid, hasErrors: errors.length > 0 };
};

export const validateAllFields = (formData) => {
  const allErrors = {};
  let isFormValid = true;

  Object.keys(formData).forEach(fieldName => {
    if (validationRules[fieldName]) {
      const rules = validationRules[fieldName];
      const fieldErrors = [];
      const value = formData[fieldName];

      rules.forEach(rule => {
        if (value && !rule.validator(value)) {
          fieldErrors.push(rule.message);
        }
      });

      if (fieldErrors.length > 0) {
        allErrors[fieldName] = fieldErrors;
        isFormValid = false;
      }
    }
  });

  return { errors: allErrors, isValid: isFormValid };
};