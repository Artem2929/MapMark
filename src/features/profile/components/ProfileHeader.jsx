import React from 'react'

const ProfileHeader = () => {
  return (
    <div style={{ 
      padding: '20px', 
      borderBottom: '1px solid #eee',
      marginBottom: '20px'
    }}>
      <h1 style={{ marginBottom: '8px' }}>Профіль користувача</h1>
      <p style={{ color: '#666' }}>Інформація про користувача</p>
    </div>
  )
}

export default ProfileHeader