import { memo, useMemo } from 'react'

const ProfileDetails = memo(({ user, isOwnProfile, onEditClick }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('uk-UA', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const formatJoinDate = (date) => {
    return new Date(date || Date.now()).toLocaleDateString('uk-UA', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const visibleDetails = useMemo(() => {
    const details = []
    
    if (user.position && user.visibility?.position !== false) {
      details.push({
        id: 'position',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
          </svg>
        ),
        content: user.position
      })
    }

    if (user.email && user.visibility?.email !== false) {
      details.push({
        id: 'email',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        ),
        content: user.email
      })
    }

    if (user.birthDate && user.visibility?.birthDate !== false) {
      details.push({
        id: 'birthDate',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
        ),
        content: formatDate(user.birthDate)
      })
    }

    if (user.location && user.visibility?.location !== false) {
      details.push({
        id: 'location',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        ),
        content: user.location
      })
    }

    details.push({
      id: 'joinDate',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
        </svg>
      ),
      content: `Приєднався ${formatJoinDate(user.createdAt || user.joinDate)}`
    })

    return details
  }, [user])

  return (
    <div className="profile-header__details">
      {isOwnProfile && (
        <button 
          className="profile-header__details-edit" 
          onClick={onEditClick} 
          title="Редагувати"
          aria-label="Редагувати деталі профілю"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
      )}
      
      {visibleDetails.map(detail => (
        <div key={detail.id} className="profile-header__detail">
          {detail.icon}
          {typeof detail.content === 'string' ? (
            <span>{detail.content}</span>
          ) : (
            detail.content
          )}
        </div>
      ))}
    </div>
  )
})

ProfileDetails.displayName = 'ProfileDetails'

export default ProfileDetails
