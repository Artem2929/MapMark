import React from 'react';
import './NotificationPanel.css';

const NotificationPanel = ({ notifications, onDismiss, onAction }) => {
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'щойно';
    if (minutes < 60) return `${minutes} хв тому`;
    return `${Math.floor(minutes / 60)} год тому`;
  };

  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-panel">
      {notifications.map(notification => (
        <div key={notification.id} className="notification-item">
          <div className="notification-icon">{notification.icon}</div>
          <div className="notification-content">
            <div className="notification-title">{notification.title}</div>
            <div className="notification-message">{notification.message}</div>
            <div className="notification-time">{formatTimeAgo(notification.timestamp)}</div>
          </div>
          <div className="notification-actions">
            {notification.action && (
              <button 
                className="notification-action-btn"
                onClick={() => onAction && onAction(notification)}
              >
                Переглянути
              </button>
            )}
            <button 
              className="notification-dismiss-btn"
              onClick={() => onDismiss && onDismiss(notification.id)}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationPanel;