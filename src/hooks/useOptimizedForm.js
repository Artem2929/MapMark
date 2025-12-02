import { useState, useCallback, useMemo } from 'react';
import { debounce } from '../utils/performance';

/**
 * Оптимізований хук для роботи з формами
 */
export const useOptimizedForm = (initialValues = {}, options = {}) => {
  const {
    validationSchema,
    onSubmit,
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
  } = options;

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Валідація поля
  const validateField = useCallback(async (name, value) => {
    if (!validationSchema) return null;

    try {
      await validationSchema.validateAt(name, { [name]: value });
      return null;
    } catch (error) {
      return error.message;
    }
  }, [validationSchema]);

  // Валідація всієї форми
  const validateForm = useCallback(async (formValues = values) => {
    if (!validationSchema) return {};

    try {
      await validationSchema.validate(formValues, { abortEarly: false });
      return {};
    } catch (error) {
      const validationErrors = {};
      error.inner.forEach(err => {
        validationErrors[err.path] = err.message;
      });
      return validationErrors;
    }
  }, [validationSchema, values]);

  // Debounced валідація
  const debouncedValidateField = useMemo(
    () => debounce(async (name, value) => {
      const error = await validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }, debounceMs),
    [validateField, debounceMs]
  );

  // Зміна значення поля
  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    if (validateOnChange) {
      debouncedValidateField(name, value);
    }
  }, [validateOnChange, debouncedValidateField]);

  // Обробник зміни
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setValue(name, fieldValue);
  }, [setValue]);

  // Обробник blur
  const handleBlur = useCallback(async (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    if (validateOnBlur) {
      const error = await validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [validateOnBlur, validateField]);

  // Скидання форми
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Встановлення помилок
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  // Встановлення значення поля
  const setFieldValue = useCallback((name, value) => {
    setValue(name, value);
  }, [setValue]);

  // Встановлення touched
  const setFieldTouched = useCallback((name, touched = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: touched
    }));
  }, []);

  // Обробник submit
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    setIsSubmitting(true);
    
    // Валідація всієї форми
    const formErrors = await validateForm();
    setErrors(formErrors);
    
    // Позначити всі поля як touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // Якщо є помилки, не відправляти
    if (Object.keys(formErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Можна встановити глобальну помилку форми
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  // Перевірка чи форма валідна
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Перевірка чи форма була змінена
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue: setFieldValue,
    setError: setFieldError,
    setTouched: setFieldTouched,
    resetForm,
    validateField,
    validateForm,
  };
};

/**
 * Хук для роботи з полем форми
 */
export const useFormField = (name, form) => {
  const value = form.values[name] || '';
  const error = form.errors[name];
  const touched = form.touched[name];
  
  const fieldProps = {
    name,
    value,
    onChange: form.handleChange,
    onBlur: form.handleBlur,
  };
  
  const fieldState = {
    error: touched ? error : undefined,
    hasError: touched && !!error,
    isTouched: touched,
  };
  
  return {
    fieldProps,
    fieldState,
    setValue: (value) => form.setValue(name, value),
    setError: (error) => form.setError(name, error),
    setTouched: (touched) => form.setTouched(name, touched),
  };
};