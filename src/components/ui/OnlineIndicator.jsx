import React from 'react';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import './OnlineIndicator.css';

const OnlineIndicator = ({ userId, size = 'sm' }) => {
  const { isOnline } = useOnlineStatus(userId);

  if (!isOnline) return null;

  return (
    <div className={`online-indicator online-indicator--${size}`}>
      <div className="online-dot" />
    </div>
  );
};

export default OnlineIndicator;