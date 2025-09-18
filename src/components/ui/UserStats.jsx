import React from 'react';
import './UserStats.css';

const UserStats = ({ stats, onStatClick }) => {
  const handleStatClick = (statType) => {
    if (onStatClick) {
      onStatClick(statType);
    }
  };

  const statItems = [
    { key: 'posts', label: 'Постів', value: stats?.posts || 0 },
    { key: 'likes', label: 'Лайків', value: stats?.likes || 0 },
    { key: 'followers', label: 'Підписників', value: stats?.followers || 0 },
    { key: 'following', label: 'Підписок', value: stats?.following || 0 }
  ];

  return (
    <div className="user-stats">
      {statItems.map((item) => (
        <div
          key={item.key}
          className="stat-item"
          onClick={() => handleStatClick(item.key)}
        >
          <div className="stat-number">{item.value}</div>
          <div className="stat-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default UserStats;