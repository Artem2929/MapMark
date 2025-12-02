import React, { memo } from 'react';
import { classNames } from '../../utils/classNames';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import './OnlineIndicator.css';

const OnlineIndicator = memo(({  userId, size = 'sm'  }) => {
  const { isOnline } = useOnlineStatus(userId);

  if (!isOnline) return null;

  return (
    <div className={`online-indicator online-indicator--${size}`}>
      <div className="online-dot" />
    </div>
  );
});

OnlineIndicator.displayName = 'OnlineIndicator';

export default OnlineIndicator;