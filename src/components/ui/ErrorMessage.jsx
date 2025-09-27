import React from 'react';
import { Link } from 'react-router-dom';
import './ErrorMessage.css';

const ErrorMessage = ({ 
  title = "Щось пішло не так", 
  message = "Спробуйте пізніше або поверніться на головну сторінку",
  showHomeLink = true 
}) => {
  return (
    <div className="error-message-container">
      <div className="error-icon">😔</div>
      <h2 className="error-title">{title}</h2>
      <p className="error-text">{message}</p>
      {showHomeLink && (
        <Link to="/" className="error-home-link">
          🏠 Повернутися на головну
        </Link>
      )}
    </div>
  );
};

export default ErrorMessage;