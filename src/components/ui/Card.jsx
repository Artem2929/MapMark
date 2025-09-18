import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  variant = 'default', 
  hover = false, 
  padding = 'medium',
  className = '',
  onClick,
  ...props 
}) => {
  const cardClasses = [
    'card',
    `card--${variant}`,
    `card--padding-${padding}`,
    hover && 'card--hover',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;