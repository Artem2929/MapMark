import React from 'react'
import { useContactForm } from '../hooks/useContactForm'

const ContactForm = () => {
  const { formData, isSubmitting, toast, errors, handleChange, handleSubmit } = useContactForm()

  return (
    <form className="about-contact-form" onSubmit={handleSubmit}>
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      )}
      
      <div className="form-group">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ваше ім'я"
          required
          disabled={isSubmitting}
          autoFocus
          className={errors.name ? 'form-input--error' : ''}
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>
      
      <div className="form-group">
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="Ваш email"
          required
          disabled={isSubmitting}
          className={errors.email ? 'form-input--error' : ''}
        />
        {errors.email && <span className="form-error">{errors.email}</span>}
      </div>
      
      <div className="form-group">
        <textarea
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          placeholder="Ваше повідомлення"
          required
          disabled={isSubmitting}
          rows={4}
          className={errors.message ? 'form-input--error' : ''}
        />
        {errors.message && <span className="form-error">{errors.message}</span>}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Надсилання...' : 'Надіслати'}
      </button>
    </form>
  )
}

export default ContactForm