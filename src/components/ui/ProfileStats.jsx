import React from 'react';
import './ProfileStats.css';

const ProfileStats = ({ stats, onStatClick }) => {
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const statItems = [
    { key: 'posts', label: 'Відгуки', value: stats.posts || 0, icon: '📝' },
    { key: 'followers', label: 'Підписники', value: stats.followers || 0, icon: '👥' },
    { key: 'following', label: 'Підписки', value: stats.following || 0, icon: '➕' },
    { key: 'messages', label: 'Повідомлення', value: stats.messages || 0, icon: '💬' }
  ];

  return (
    <div className="profile-stats">
      {statItems.map((stat) => (
        <div 
          key={stat.key}
          className="profile-stat-item"
          onClick={() => onStatClick?.(stat.key)}
        >
          <div className="profile-stat-icon">{stat.icon}</div>
          <div className="profile-stat-content">
            <div className="profile-stat-value">{formatNumber(stat.value)}</div>
            <div className="profile-stat-label">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;