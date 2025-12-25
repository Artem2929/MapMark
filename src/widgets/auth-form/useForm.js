import { useState, useCallback } from 'react'
import { validateField } from '../../../features/auth/validation/validators.js'

export function useForm(initialValues, validationSchema) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Валідація при зміні, якщо поле вже було touched
    if (touched[name] && validationSchema[name]) {
      const error = validateField(value, validationSchema[name])
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [touched, validationSchema])

  const setFieldTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    
    // Валідація при blur
    if (validationSchema[name]) {
      const error = validateField(values[name], validationSchema[name])
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [values, validationSchema])

  const validateAll = useCallback(() => {
    const newErrors = {}
    let isValid = true

    Object.keys(validationSchema).forEach(field => {
      const error = validateField(values[field], validationSchema[field])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    setTouched(Object.keys(validationSchema).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {}))

    return isValid
  }, [values, validationSchema])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    isValid: Object.values(errors).every(error => !error)
  }
}