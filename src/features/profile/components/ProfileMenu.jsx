import { memo } from 'react'
import { Link } from 'react-router-dom'

const ProfileMenu = memo(({ userId, onEditClick }) => {
  return (
    <div className="profile-header__menu">
      <button 
        onClick={onEditClick} 
        className="profile-header__menu-item profile-header__menu-item--button"
      >
        Редагувати профіль
      </button>
      <Link to="/friends" className="profile-header__menu-item">
        Мої друзі
      </Link>
      <Link to={`/messages/${userId}`} className="profile-header__menu-item">
        Мої повідомлення
      </Link>
      <Link to="/photos" className="profile-header__menu-item">
        Мої фото
      </Link>
    </div>
  )
})

ProfileMenu.displayName = 'ProfileMenu'

export default ProfileMenu
