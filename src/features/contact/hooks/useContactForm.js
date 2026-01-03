import { useState, useCallback, useMemo } from 'react'
import { contactService } from '../services/contactService'

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateName = (name) => {
  const nameRegex = /^[a-zA-Zа-яА-ЯіІїЇєЄ\s'-]+$/
  return nameRegex.test(name) && name.length >= 2 && name.length <= 100
}

export const useContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [errors, setErrors] = useState({})

  const validation = useMemo(() => {
    const newErrors = {}
    
    if (formData.name && !validateName(formData.name)) {
      newErrors.name = 'Невірний формат імені'
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Невірний формат email'
    }
    
    if (formData.message && (formData.message.length < 10 || formData.message.length > 1000)) {
      newErrors.message = 'Повідомлення повинно містити від 10 до 1000 символів'
    }
    
    return newErrors
  }, [formData])

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (toast) setToast(null)
  }, [toast])

  const resetForm = useCallback(() => {
    setFormData({ name: '', email: '', message: '' })
    setErrors({})
  }, [])

  const showToast = useCallback((message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    // Перевірка обов'язкових полів
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showToast('Будь ласка, заповніть всі поля', 'error')
      return
    }

    // Перевірка валідації
    if (Object.keys(validation).length > 0) {
      showToast('Виправте помилки у формі', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await contactService.sendMessage(formData)
      if (response.status === 'success') {
        showToast('Повідомлення надіслано успішно!', 'success')
        resetForm()
      } else {
        showToast(response.message || 'Помилка надсилання', 'error')
      }
    } catch (error) {
      showToast(error.message || 'Помилка надсилання повідомлення', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validation, showToast, resetForm])

  return {
    formData,
    isSubmitting,
    toast,
    errors: validation,
    handleChange,
    handleSubmit
  }
}