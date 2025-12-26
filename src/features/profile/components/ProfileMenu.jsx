import React, { memo } from 'react'
import { useProfile } from '../../../contexts/ProfileContext'
import { getUserId } from '../utils/profileUtils'
import { Link, useLocation } from 'react-router-dom'
import './ProfileMenu.css'

const ProfileMenu = memo(({ userId }) => {
  const location = useLocation()
  const { user } = useProfile()

  if (!userId) {
    console.warn('ProfileMenu: userId prop is required')
    return null
  }

  const menuItems = [
    {
      id: 'friends',
      label: 'Мої друзі',
      path: '/friends',
      count: user?.followers?.length || 0
    },
    {
      id: 'messages',
      label: 'Мої повідомлення',
      path: `/messages/${userId}`,
      count: user?.unreadMessages || 0
    },
    {
      id: 'photos',
      label: 'Мої фото',
      path: '/photos',
      count: user?.photos?.length || 0
    }
  ]

  const isActiveRoute = (itemPath) => {
    if (itemPath.includes('${userId}')) {
      return location.pathname.startsWith(itemPath.split('${userId}')[0])
    }
    return location.pathname === itemPath
  }

  return (
    <div className="profile-menu">
      {menuItems.map(item => (
        <Link
          key={item.id}
          to={item.path}
          className={`profile-menu__item ${isActiveRoute(item.path) ? 'active' : ''}`}
        >
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
