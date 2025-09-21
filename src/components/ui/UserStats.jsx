import React from 'react';
import './UserStats.css';

const UserStats = ({ stats, onStatClick }) => {
  const handleStatClick = (statType) => {
    if (onStatClick) {
      onStatClick(statType);
    }
  };

  const statItems = [
    { key: 'messages', label: 'Повідомлення', value: stats?.messages || 0 },
    { key: 'posts', label: 'Пости', value: stats?.posts || 0 },
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