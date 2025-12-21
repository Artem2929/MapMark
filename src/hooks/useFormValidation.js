import { useState, useCallback } from 'react';
import { validateField, validateForm } from '../pages/Login/Login.schema';

export const useFormValidation = (initialData, schema) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((name, value) => {
    setData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value, schema);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [schema, touched]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, data[name], schema);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [data, schema]);

  const validate = useCallback(() => {
    const validation = validateForm(data, schema);
    setErrors(validation.errors);
    setTouched(Object.keys(schema).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return validation.isValid;
  }, [data, schema]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  return {
    data,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset
  };
};