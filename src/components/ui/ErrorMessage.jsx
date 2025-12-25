import React from 'react'

const ErrorMessage = ({ title, message }) => {
  return (
    <div style={{ 
      padding: '40px 20px', 
      textAlign: 'center',
      color: '#666'
    }}>
      <h2 style={{ marginBottom: '16px', color: '#333' }}>{title}</h2>
      <p>{message}</p>
    </div>
  )
}

export default ErrorMessage