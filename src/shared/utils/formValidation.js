import { validators } from '../../utils/validators'

export const createFieldValidator = (field, formData) => {
  const validatorMap = {
    name: (value) => validators.required(value) || 
           (value && value.length < 2 ? "Ім'я має бути мінімум 2 символи" : null),
    
    email: (value) => validators.required(value) || validators.email(value),
    
    password: (value) => validators.required(value) || 
              (value && value.length < 6 ? 'Пароль має бути мінімум 6 символів' : null),
    
    confirmPassword: (value) => {
      if (!value) return 'Підтвердіть пароль'
      if (value !== formData.password) return 'Паролі не співпадають'
      return null
    },
    
    country: (value) => !value ? 'Оберіть країну' : null,
    
    acceptTerms: (value) => !value ? 'Прийміть умови використання' : null,
    
    acceptPrivacy: (value) => !value ? 'Прийміть політику конфіденційності' : null
  }
  
  return validatorMap[field] || (() => null)
}

export const validateAllFields = (formData, fields) => {
  const errors = {}
  
  fields.forEach(field => {
    const validator = createFieldValidator(field, formData)
    const error = validator(formData[field])
    if (error) {
      errors[field] = error
    }
  })
  
  return errors
}

export const isFormValid = (errors) => {
  return Object.values(errors).every(error => !error)
}