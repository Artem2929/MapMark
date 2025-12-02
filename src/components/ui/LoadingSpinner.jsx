import React, { memo } from 'react';
import { classNames } from '../../utils/classNames';
import './LoadingSpinner.css';

const LoadingSpinner = memo(({  message = "Завантаження..."  }) => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;