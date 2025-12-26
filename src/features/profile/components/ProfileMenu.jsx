import React, { memo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useProfile } from '../../../contexts/ProfileContext'
import './ProfileMenu.css'

const ProfileMenu = memo(({ userId }) => {
  const location = useLocation()
  const { user } = useProfile()

  const menuItems = [
    { 
      id: 'friends', 
      label: 'Мої друзі', 
      icon: '👥', 
      path: '/friends',
      count: user?.followers?.length || 0
    },
    { 
      id: 'messages', 
      label: 'Мої повідомлення', 
      icon: '💬', 
      path: `/messages/${userId}`,
      count: user?.unreadMessages || 0
    },
    { 
      id: 'photos', 
      label: 'Мої фото', 
      icon: '🖼️', 
      path: '/photos',
      count: user?.photos?.length || 0
    }
  ]

  return (
    <div className="profile-menu">
      {menuItems.map(item => (
        <Link 
          key={item.id}
          to={item.path}
          className={`profile-menu__item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <span className="profile-menu__icon">{item.icon}</span>
          <span className="profile-menu__label">{item.label}</span>
          {item.count > 0 && (
            <span className="profile-menu__count">{item.count}</span>
          )}
        </Link>
      ))}
    </div>
  )
})

ProfileMenu.displayName = 'ProfileMenu'

export default ProfileMenu