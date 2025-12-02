import React, { memo } from 'react';
import { classNames } from '../../utils/classNames';
import './ActivityIndicator.css';

const ActivityIndicator = memo(({  status, lastSeen  }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'online':
        return { color: '#00C851', text: 'В мережі' };

ActivityIndicator.displayName = 'ActivityIndicator';
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
      <span className="activity-text">{text}</span>
    </div>
  );
});

ActivityIndicator.displayName = 'ActivityIndicator';

export default ActivityIndicator;