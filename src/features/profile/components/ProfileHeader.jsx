import { memo, useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PhotosSection from './PhotosSection'
import ProfileEditForm from '../../../components/forms/ProfileEditForm'
import AvatarUploadModal from '../../../components/forms/AvatarUploadModal'
import { useProfileEdit } from '../hooks/useProfileEdit'
import { profileService } from '../services/profileService'
import { followsService } from '../services/followsService'
import './ProfileHeader.css'

const ProfileHeader = memo(({ user, isOwnProfile, onUserUpdate, onEditingStateChange }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [isFollowing, setIsFollowing] = useState(user?.isFollowing || false)
  const [followLoading, setFollowLoading] = useState(false)
  const { saveProfile } = useProfileEdit(user)
  
  // Оновлюємо статус підписки коли змінюється user
  useEffect(() => {
    if (user?.isFollowing !== undefined) {
      setIsFollowing(user.isFollowing)
    }
  }, [user?.isFollowing])

  const handleFollowToggle = useCallback(async () => {
    if (followLoading || !user?.id) return
    
    setFollowLoading(true)
    try {
      if (isFollowing) {
        const result = await followsService.unfollowUser(user.id)
        if (result.success) {
          setIsFollowing(false)
          if (onUserUpdate) {
            onUserUpdate({
              ...user,
              followersCount: Math.max(0, (user.followersCount || 0) - 1)
            })
          }
        }
      } else {
        const result = await followsService.followUser(user.id)
        if (result.success) {
          setIsFollowing(true)
          if (onUserUpdate) {
            onUserUpdate({
              ...user,
              followersCount: (user.followersCount || 0) + 1
            })
          }
        }
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err)
    } finally {
      setFollowLoading(false)
    }
  }, [isFollowing, followLoading, user, onUserUpdate])
  
  if (!user) return null

  const handleAvatarUpload = useCallback(async (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const result = await profileService.uploadAvatar(formData)
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
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  <circle cx="16.5" cy="8.5" r="1.5"/>
                </svg>
              </button>
            )}
          </div>
          
          {isOwnProfile && (
            <div className="profile-header__menu">
              <button onClick={handleEditProfile} className="profile-header__menu-item profile-header__menu-item--button">Редагувати профіль</button>
              <Link to="/friends" className="profile-header__menu-item">Мої друзі</Link>
              <Link to={`/messages/${user.id}`} className="profile-header__menu-item">Мої повідомлення</Link>
              <Link to="/photos" className="profile-header__menu-item">Мої фото</Link>
            </div>
          )}
        </div>
        
        <div className="profile-header__info">
          <div className="profile-header__name-wrapper">
            <h1 className="profile-header__name">{user.name}{user.surname ? ` ${user.surname}` : ''}</h1>
            {user.isOnline && <span className="profile-header__online">online</span>}
          </div>
          
          <div className="profile-header__details">
            {isOwnProfile && (
              <button className="profile-header__details-edit" onClick={handleEditProfile} title="Редагувати">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </button>
            )}
            
            {user.position && user.visibility?.position !== false && (
              <div className="profile-header__detail">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
                </svg>
                <span>{user.position}</span>
              </div>
            )}
            
            {user.email && user.visibility?.email !== false && (
              <div className="profile-header__detail">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span>{user.email}</span>
              </div>
            )}
            
            {user.birthDate && user.visibility?.birthDate !== false && (
              <div className="profile-header__detail">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span>{new Date(user.birthDate).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            )}
            
            {user.location && user.visibility?.location !== false && (
              <div className="profile-header__detail">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span>{user.location}</span>
              </div>
            )}
            
            {user.website && user.visibility?.website !== false && (
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
          
          <div className="profile-header__bio-wrapper">
            {user.bio ? (
              <>
                <span className="profile-header__bio-label">Про себе:</span>
                <span className="profile-header__bio">{user.bio}</span>
              </>
            ) : (
              <div className="bio-empty">
                <div className="bio-empty__icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                  </svg>
                </div>
                <p>Опис не додано</p>
                {isOwnProfile && (
                  <button className="bio-empty__btn" onClick={handleEditProfile}>
                    <span>＋</span> Додати про себе
                  </button>
                )}
              </div>
            )}
          </div>
          
          <PhotosSection key={user.id} userId={user.id} isOwnProfile={isOwnProfile} />
        </div>
        
        <div className="profile-header__actions profile-header__actions--hidden">
          {isOwnProfile ? (
            <button className="profile-header__edit-btn" onClick={handleEditProfile}>
              Редагувати профіль
            </button>
          ) : (
            <>
              <button 
                className={`profile-header__follow-btn ${isFollowing ? 'profile-header__follow-btn--following' : ''}`}
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading ? 'Завантаження...' : isFollowing ? 'Відписатися' : 'Підписатися'}
              </button>
              <Link to={`/messages/${user.id}`} className="profile-header__message-btn">
                Написати
              </Link>
            </>
          )}
        </div>
      </div>
      
      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-number">{user.postsCount || 0}</span>
          <span className="stat-label">Записів</span>
        </div>

        <div className="stat-card">
          <span className="stat-number">{user.followingCount || 0}</span>
          <span className="stat-label">Підписок</span>
        </div>

        <div className="stat-card">
          <span className="stat-number">{user.followersCount || 0}</span>
          <span className="stat-label">Підписників</span>
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