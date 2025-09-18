import React from 'react';
import './Container.css';

const Container = ({ 
  children, 
  size = 'default',
  className = '',
  ...props 
}) => {
  const containerClasses = [
    'container',
    `container--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
};

export default Container;