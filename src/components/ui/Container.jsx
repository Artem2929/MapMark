import React, { memo } from 'react';
import { classNames } from '../../utils/classNames';
import './Container.css';

const Container = memo(({  
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

Container.displayName = 'Container';

  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
};

export default Container;