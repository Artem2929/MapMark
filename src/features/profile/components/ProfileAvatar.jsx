import React, { memo, useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { validateFileUpload, showNotification, getUserId } from '../utils/profileUtils'
import './ProfileAvatar.css'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'

const ProfileAvatar = memo(({ user, isOwnProfile = false, onAvatarChange }) => {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      validateFileUpload(file)
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setSelectedFile(file)
      setImageError(false)
    } catch (error) {
      showNotification(error.message)
    }
  }

  const handleSave = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('avatar', selectedFile)
      
      if (onAvatarChange) {
        await onAvatarChange(formData)
        
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
        }
        setPreviewUrl(null)
        setSelectedFile(null)
        
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        showNotification('Аватар успішно оновлено', 'success')
      }
    } catch (error) {
      showNotification(error.message || 'Не вдалося завантажити аватар')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAvatarClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const avatarUrl = user?.avatar 
    ? (user.avatar.startsWith('data:') || user.avatar.startsWith('http') 
        ? user.avatar 
        : `${API_BASE_URL}${user.avatar}`)
    : null
  const displayImage = previewUrl || avatarUrl
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U'

  const ProfileAvatarMenu = () => {
    const location = useLocation()
    const userId = getUserId(user)
    
    const menuItems = [
      { path: '/friends', label: 'Мої друзі', count: user?.followers?.length || 0 },
      { path: `/messages/${userId}`, label: 'Повідомлення', count: 0 },
      { path: `/photos/${userId}`, label: 'Фото', count: user?.photos?.length || 0 }
    ]

    return (
      <nav className="profile-avatar-menu">
        <ul className="profile-avatar-menu__list">
          {menuItems.map(item => (
            <li key={item.path} className="profile-avatar-menu__item">
              <Link 
                to={item.path}
                className={`profile-avatar-menu__link ${
                  location.pathname === item.path ? 'active' : ''
                }`}
              >
                {item.label} <span className="profile-avatar-menu__count">{item.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  return (
    <div className="profile-avatar-container">
      <div 
        className="profile-avatar-large"
        onClick={handleAvatarClick}
      >
        {displayImage && !imageError ? (
          <img 
            src={displayImage} 
            alt={user?.name || 'Avatar'} 
            className="profile-avatar-image"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        ) : (
          <div className="profile-avatar-placeholder">
            {userInitial}
          </div>
        )}

        {isOwnProfile && (
          <div className="profile-avatar-upload-overlay">
            <div className="profile-avatar-upload-text">
              Змінити<br/>фото
            </div>
          </div>
        )}
      </div>

      {isOwnProfile && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="profile-avatar-input"
        />
      )}

      {selectedFile && (
        <div className="profile-avatar-actions">
          <button 
            onClick={handleSave}
            disabled={isUploading}
            className="profile-basic-info__edit-btn"
          >
            {isUploading ? 'Збереження...' : 'Зберегти'}
          </button>
          <button 
            onClick={handleCancel}
            disabled={isUploading}
            className="profile-basic-info__edit-btn"
          >
            Скасувати
          </button>
        </div>
      )}

      {isOwnProfile && <ProfileAvatarMenu />}
    </div>
  )
})

ProfileAvatar.displayName = 'ProfileAvatar'

export default ProfileAvatar