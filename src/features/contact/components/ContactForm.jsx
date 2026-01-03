import React from 'react'
import { useContactForm } from '../hooks/useContactForm'
import { Toast } from '../../../components/ui/Toast'
import { FormField } from '../../../components/ui/FormField'

const ContactForm = () => {
  const { formData, isSubmitting, toast, errors, handleChange, handleSubmit, resetForm } = useContactForm()

  // Обробник скасування форми
  const handleReset = () => {
    resetForm()
  }

  return (
    <form className="about-contact-form" onSubmit={handleSubmit}>
      {toast && (
        <Toast message={toast.message} type={toast.type} />
      )}
      
      <FormField
        type="text"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="Ваше ім'я"
        required
        disabled={isSubmitting}
        autoFocus
        error={errors.name}
        maxLength={50}
        showCounter
      />
      
      <FormField
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        placeholder="Ваш email"
        required
        disabled={isSubmitting}
        error={errors.email}
        maxLength={100}
        showCounter
      />
      
      <FormField
        type="textarea"
        value={formData.message}
        onChange={(e) => handleChange('message', e.target.value)}
        placeholder="Ваше повідомлення"
        required
        disabled={isSubmitting}
        error={errors.message}
        maxLength={1000}
        showCounter
        autoResize
      />
      
      <div className="about-contact-form__actions">
        <button type="button" className="btn secondary" onClick={handleReset} disabled={isSubmitting}>
          Скасувати
        </button>
        <button type="submit" className="btn primary" disabled={isSubmitting}>
          {isSubmitting ? 'Надсилання...' : 'Надіслати'}
        </button>
      </div>
    </form>
  )
}

export default ContactForm