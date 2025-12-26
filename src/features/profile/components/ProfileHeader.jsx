import React, { memo } from 'react'
import PhotosSection from './PhotosSection'
import './ProfileHeader.css'

const ProfileHeader = memo(({ user, isOwnProfile }) => {
  if (!user) return null

  return (
    <div className="profile-header">
      <div className="profile-header__content">
        <div className="profile-header__left">
          <div className="profile-header__avatar-section">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="profile-header__avatar"
            />
            {isOwnProfile && (
              <button className="profile-header__edit-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </button>
            )}
          </div>
          
          {isOwnProfile && (
            <div className="profile-header__menu">
              <a href="#" className="profile-header__menu-item">Редагувати профіль</a>
              <a href="#" className="profile-header__menu-item">Мої друзі</a>
              <a href="#" className="profile-header__menu-item">Мої повідомлення</a>
              <a href="#" className="profile-header__menu-item">Мої фото</a>
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
                  {user.website.replace('https://', '')}
                </a>
              </div>
            )}
            
            <div className="profile-header__detail">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
              <span>Приєднався {new Date(user.joinDate).toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          
          <div className="profile-header__stats">
            <div className="profile-header__stat">
              <span className="profile-header__stat-number">{user.postsCount}</span>
              <span className="profile-header__stat-label">Записів</span>
            </div>
            <div className="profile-header__stat">
              <span className="profile-header__stat-number">{user.followingCount}</span>
              <span className="profile-header__stat-label">Підписок</span>
            </div>
            <div className="profile-header__stat">
              <span className="profile-header__stat-number">{user.followersCount}</span>
              <span className="profile-header__stat-label">Підписників</span>
            </div>
          </div>
          
          <PhotosSection photos={user?.photos || []} isOwnProfile={isOwnProfile} />
        </div>
        
        <div className="profile-header__actions" style={{ display: 'none' }}>
          {isOwnProfile ? (
            <button className="profile-header__edit-btn">
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
    </div>
  )
})

ProfileHeader.displayName = 'ProfileHeader'

export default ProfileHeader