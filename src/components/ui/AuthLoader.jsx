import React from 'react';
import './AuthLoader.css';

const AuthLoader = ({ message = 'Завантаження...' }) => {
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
};

export default AuthLoader;