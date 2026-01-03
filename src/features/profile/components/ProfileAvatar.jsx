import { memo } from 'react'

const ProfileAvatar = memo(({ 
  avatar, 
  name, 
  isOwnProfile, 
  onEditClick 
}) => {
  const handleImageError = (e) => {
    e.target.src = '/default-avatar.svg'
  }

  return (
    <div className="profile-header__avatar-section">
      <img 
        src={avatar || '/default-avatar.svg'} 
        alt={name || 'Аватар'}
        className="profile-header__avatar"
        onError={handleImageError}
      />
      {isOwnProfile && (
        <button 
          className="profile-header__edit-avatar"
          onClick={onEditClick}
          aria-label="Змінити аватар"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            <circle cx="16.5" cy="8.5" r="1.5"/>
          </svg>
        </button>
      )}
    </div>
  )
})

ProfileAvatar.displayName = 'ProfileAvatar'

export default ProfileAvatar
