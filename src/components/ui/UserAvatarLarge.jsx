import React, { memo } from 'react';
import { classNames } from '../../utils/classNames';
import './UserAvatarLarge.css';

const UserAvatarLarge = memo(({ 
  avatarUrl,
  fullName,
  username,
  location,
  joinedAt,
  isFollowing = false,
  onFollowToggle,
  onMessage
 }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

UserAvatarLarge.displayName = 'UserAvatarLarge';
  };

  const formatJoinedDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long' };
    return `З нами з ${date.toLocaleDateString('uk-UA', options)}`;
  };

  return (
    <div className="user-avatar-large-container">
      <div className="avatar-section">
        <div className="avatar-wrapper">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="avatar-image" />
          ) : (
            <div className="avatar-initials">
              {getInitials(fullName)}
            </div>
          )}
        </div>
      </div>

      <div className="user-info-section">
        <h1 className="user-full-name">{fullName}</h1>
        
        {username && (
          <p className="user-username">{username}</p>
        )}
        
        {location && (
          <div className="user-location">
            <span className="location-icon">📍</span>
            <span>{location}</span>
          </div>
        )}
        
        {joinedAt && (
          <div className="user-joined">
            <span className="calendar-icon">📅</span>
            <span>{formatJoinedDate(joinedAt)}</span>
          </div>
        )}
      </div>

      <div className="actions-section">
        {onFollowToggle && (
          <button
            className={`follow-button ${isFollowing ? 'following' : ''}`}
            onClick={onFollowToggle}
          >
            {isFollowing ? 'Ви підписані' : 'Підписатися'}
          </button>
        )}
        
        {onMessage && (
          <button
            className="message-button"
            onClick={onMessage}
          >
            <span className="message-icon">✉️</span>
            Повідомлення
          </button>
        )}
      </div>
    </div>
  );
};

export default UserAvatarLarge;