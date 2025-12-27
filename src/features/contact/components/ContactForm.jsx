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
          maxLength={50}
        />
        <div className="form-counter">
          <span className={formData.name.length > 50 ? 'form-counter--error' : ''}>
            {formData.name.length}/50
          </span>
        </div>
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
          maxLength={100}
        />
        <div className="form-counter">
          <span className={formData.email.length > 100 ? 'form-counter--error' : ''}>
            {formData.email.length}/100
          </span>
        </div>
        {errors.email && <span className="form-error">{errors.email}</span>}
      </div>
      
      <div className="form-group">
        <textarea
          value={formData.message}
          onChange={(e) => {
            handleChange('message', e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
          placeholder="Ваше повідомлення"
          required
          disabled={isSubmitting}
          className={errors.message ? 'form-input--error' : ''}
          maxLength={1000}
          style={{ minHeight: '100px' }}
        />
        <div className="form-counter">
          <span className={formData.message.length > 1000 ? 'form-counter--error' : ''}>
            {formData.message.length}/1000
          </span>
        </div>
        {errors.message && <span className="form-error">{errors.message}</span>}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Надсилання...' : 'Надіслати'}
      </button>
    </form>
  )
}

export default ContactForm