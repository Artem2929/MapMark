import React from 'react';
import './PasswordStrength.css';

const PasswordStrength = ({ password }) => {
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: '' };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    const levels = [
      { score: 0, text: '', color: '' },
      { score: 1, text: 'Дуже слабкий', color: '#ef4444' },
      { score: 2, text: 'Слабкий', color: '#f97316' },
      { score: 3, text: 'Середній', color: '#eab308' },
      { score: 4, text: 'Сильний', color: '#22c55e' },
      { score: 5, text: 'Дуже сильний', color: '#16a34a' }
    ];
    
    return levels[score];
  };

  const strength = getStrength(password);
  
  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="strength-bar">
        <div 
          className="strength-fill" 
          style={{ 
            width: `${(strength.score / 5) * 100}%`,
            backgroundColor: strength.color 
          }}
        />
      </div>
      <span className="strength-text" style={{ color: strength.color }}>
        {strength.text}
      </span>
    </div>
  );
};

export default PasswordStrength;