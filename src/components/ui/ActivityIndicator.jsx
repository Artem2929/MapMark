import React from 'react';
import './ActivityIndicator.css';

const ActivityIndicator = ({ status, lastSeen }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'online':
        return { color: '#00C851', text: 'В мережі' };
      case 'away':
        return { color: '#FFB900', text: 'Відійшов' };
      case 'offline':
        return { color: '#6C757D', text: lastSeen || 'Не в мережі' };
      default:
        return { color: '#6C757D', text: 'Невідомо' };
    }
  };

  const { color, text } = getStatusInfo();

  return (
    <div className="activity-indicator">
      <span 
        className={`activity-dot activity-dot--${status}`}
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

export default ActivityIndicator;