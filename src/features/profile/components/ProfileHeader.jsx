import React from 'react'
import './ProfileHeader.css'

const ProfileHeader = () => {
  return (
    <div className="profile-header-container">
      <h1 className="profile-header__title">Профіль користувача</h1>
      <p className="profile-header__description">Інформація про користувача</p>
    </div>
  )
}

export default ProfileHeader