import { useState, useCallback } from 'react'
import { contactService } from '../services/contactService'

export const useContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (toast) setToast(null)
  }, [toast])

  const resetForm = useCallback(() => {
    setFormData({ name: '', email: '', message: '' })
  }, [])

  const showToast = useCallback((message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showToast('Будь ласка, заповніть всі поля', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      await contactService.sendMessage(formData)
      showToast('Повідомлення надіслано успішно!', 'success')
      resetForm()
    } catch (error) {
      showToast(error.message || 'Помилка надсилання повідомлення', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, showToast, resetForm])

  return {
    formData,
    isSubmitting,
    toast,
    handleChange,
    handleSubmit
  }
}