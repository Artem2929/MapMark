import React from 'react';
import './ProfileBadge.css';

const ProfileBadge = ({ type, size = 'sm' }) => {
  const badges = {
    verified: { icon: '✓', label: 'Верифікований', color: '#1DA1F2' },
    premium: { icon: '★', label: 'Преміум', color: '#FFD700' },
    moderator: { icon: '⚡', label: 'Модератор', color: '#9146FF' },
    new: { icon: '🆕', label: 'Новачок', color: '#00C851' }
  };

  const badge = badges[type];
  if (!badge) return null;

  return (
    <span 
      className={`profile-badge profile-badge--${size}`}
      style={{ backgroundColor: badge.color }}
      title={badge.label}
    >
      {badge.icon}
    </span>
  );
};

export default ProfileBadge;