import React, { memo } from 'react';
import { classNames } from '../../utils/classNames';
import './Card.css';

const Card = memo(({  
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
});

Card.displayName = 'Card';

export default Card;