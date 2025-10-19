import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ProfileMenu.css';

const ProfileMenu = ({ userId }) => {
  const location = useLocation();

  const menuItems = [
    { 
      id: 'friends', 
      label: 'Мої друзі', 
      icon: '👥', 
      path: `/friends`,
      count: 12
    },
    { 
      id: 'messages', 
      label: 'Мої повідомлення', 
      icon: '💬', 
      path: `/messages`,
      count: 3
    },
    { 
      id: 'photos', 
      label: 'Мої фото', 
      icon: '🖼️', 
      path: `/photos`,
      count: 24
    }
  ];

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
  );
};

export default ProfileMenu;