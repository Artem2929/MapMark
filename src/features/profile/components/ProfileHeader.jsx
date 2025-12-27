import React, { memo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import PhotosSection from './PhotosSection'
import ProfileEditForm from './ProfileEditForm'
import AvatarUploadModal from './AvatarUploadModal'
import { useProfileEdit } from '../hooks/useProfileEdit'
import { uploadAvatar } from '../services/profileService'
import './ProfileHeader.css'

const ProfileHeader = memo(({ user, isOwnProfile, onUserUpdate, onEditingStateChange }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const { saveProfile } = useProfileEdit(user)
  
  if (!user) return null

  const handleAvatarUpload = useCallback(async (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const result = await uploadAvatar(formData)
    if (onUserUpdate && result.data?.user) {
      onUserUpdate(result.data.user)
    }
  }, [onUserUpdate])

  const handleEditProfile = useCallback(() => {
    setIsEditing(true)
    if (onEditingStateChange) onEditingStateChange(true)
  }, [onEditingStateChange])

  const handleSaveProfile = useCallback(async (profileData) => {
    const updatedUser = await saveProfile(profileData)
    console.log('Updated user data:', updatedUser)
    if (onUserUpdate) {
      onUserUpdate(updatedUser.data.user)
    }
    setIsEditing(false)
    if (onEditingStateChange) onEditingStateChange(false)
  }, [saveProfile, onUserUpdate, onEditingStateChange])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    if (onEditingStateChange) onEditingStateChange(false)
  }, [onEditingStateChange])

  const formatWebsiteUrl = useCallback((url) => {
    if (!url) return ''
    return url.replace(/^https?:\/\//, '')
  }, [])

  const formatJoinDate = useCallback((date) => {
    const joinDate = new Date(date || Date.now())
    return joinDate.toLocaleDateString('uk-UA', { 
      month: 'long', 
      year: 'numeric' 
    })
  }, [])

  if (isEditing) {
    return (
      <ProfileEditForm
        user={user}
        onSave={handleSaveProfile}
        onCancel={handleCancelEdit}
      />
    )
  }

  return (
    <div className="profile-header">
      <div className="profile-header__content">
        <div className="profile-header__left">
          <div className="profile-header__avatar-section">
            <img 
              src={user.avatar || '/default-avatar.svg'} 
              alt={user.name || 'Аватар'}
              className="profile-header__avatar"
              onError={(e) => {
                e.target.src = '/default-avatar.svg'
              }}
            />
            {isOwnProfile && (
              <button 
                className="profile-header__edit-avatar"
                onClick={() => setShowAvatarModal(true)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z"/>
                </svg>
              </button>
            )}
          </div>
          
          {isOwnProfile && (
            <div className="profile-header__menu">
              <button onClick={handleEditProfile} className="profile-header__menu-item profile-header__menu-item--button">Редагувати профіль</button>
              <Link to="/friends" className="profile-header__menu-item">Мої друзі</Link>
              <Link to="/messages" className="profile-header__menu-item">Мої повідомлення</Link>
              <Link to="/photos" className="profile-header__menu-item">Мої фото</Link>
            </div>
          )}
        </div>
        
        <div className="profile-header__info">
          <h1 className="profile-header__name">{user.name}</h1>
          <p className="profile-header__bio">{user.bio}</p>
          
          <div className="profile-header__details">
            {user.location && (
              <div className="profile-header__detail">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span>{user.location}</span>
              </div>
            )}
            
            {user.website && (
              <div className="profile-header__detail">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                </svg>
                <a href={user.website} target="_blank" rel="noopener noreferrer">
                  {formatWebsiteUrl(user.website)}
                </a>
              </div>
            )}
            
            <div className="profile-header__detail">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
              <span>Приєднався {new Date(user.createdAt || user.joinDate).toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          
          <div className="profile-header__stats">
            <div className="profile-header__stat">
              <span className="profile-header__stat-number">{user.postsCount || 0}</span>
              <span className="profile-header__stat-label">Записів</span>
            </div>
            <div className="profile-header__stat">
              <span className="profile-header__stat-number">{user.followingCount || 0}</span>
              <span className="profile-header__stat-label">Підписок</span>
            </div>
            <div className="profile-header__stat">
              <span className="profile-header__stat-number">{user.followersCount || 0}</span>
              <span className="profile-header__stat-label">Підписників</span>
            </div>
          </div>
          
          <PhotosSection userId={userId} isOwnProfile={isOwnProfile} />
        </div>
        
        <div className="profile-header__actions profile-header__actions--hidden">
          {isOwnProfile ? (
            <button className="profile-header__edit-btn" onClick={handleEditProfile}>
              Редагувати профіль
            </button>
          ) : (
            <>
              <button className="profile-header__follow-btn">
                Підписатися
              </button>
              <button className="profile-header__message-btn">
                Написати
              </button>
            </>
          )}
        </div>
      </div>
      
      {showAvatarModal && (
        <AvatarUploadModal
          onClose={() => setShowAvatarModal(false)}
          onUpload={handleAvatarUpload}
          currentAvatar={user.avatar}
        />
      )}
    </div>
  )
})

ProfileHeader.displayName = 'ProfileHeader'

export default ProfileHeader