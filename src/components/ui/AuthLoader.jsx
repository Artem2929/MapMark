import React, { memo } from 'react';
import { classNames } from '../../utils/classNames';
import './AuthLoader.css';

const AuthLoader = memo(({  message = 'Завантаження...'  }) => {
  return (
    <div className="auth-loader">
      <div className="auth-loader-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <p className="auth-loader-message">{message}</p>
    </div>
  );
});

AuthLoader.displayName = 'AuthLoader';

export default AuthLoader;