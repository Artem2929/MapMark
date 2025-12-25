import React from 'react'

const Wall = ({ userId, isOwnProfile, user }) => {
  return (
    <div style={{ 
      padding: '20px',
      borderTop: '1px solid #eee',
      marginTop: '20px'
    }}>
      <h3 style={{ marginBottom: '16px' }}>Стіна</h3>
      {isOwnProfile && (
        <div style={{ 
          padding: '16px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <textarea 
            placeholder="Що у вас нового?"
            style={{
              width: '100%',
              minHeight: '80px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '8px',
              resize: 'vertical'
            }}
          />
          <button style={{
            marginTop: '8px',
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Опублікувати
          </button>
        </div>
      )}
      <p style={{ color: '#666', textAlign: 'center', padding: '40px 0' }}>
        Записів поки немає
      </p>
    </div>
  )
}

export default Wall