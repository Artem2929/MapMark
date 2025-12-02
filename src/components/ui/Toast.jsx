import React, { useEffect, memo } from 'react';
import { classNames } from '../../utils/classNames';
import './Toast.css';

const Toast = memo(({  message, type = 'success', onClose, duration = 3000  }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      default: return '✅';
    }
  };

  return (
    <div className={`toast toast--${type}`}>
      <div className="toast__content">
        <span className="toast__icon">{getIcon()}</span>
        <span className="toast__message">{message}</span>
      </div>
      <button className="toast__close" onClick={onClose}>×</button>
    </div>
  );
});

Toast.displayName = 'Toast';

export default Toast;