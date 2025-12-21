import React from 'react';

const ActivityIndicator = ({ isActive = false, size = 'sm' }) => {
  return (
    <div className={`activity-indicator activity-indicator--${size} ${isActive ? 'active' : ''}`}>
      <div className="activity-dot"></div>
    </div>
  );
};

export default ActivityIndicator;