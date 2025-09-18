import React from 'react';
import './Grid.css';

const Grid = ({ 
  children, 
  columns = 'auto',
  gap = 'medium',
  className = '',
  ...props 
}) => {
  const gridClasses = [
    'grid',
    `grid--columns-${columns}`,
    `grid--gap-${gap}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
};

export default Grid;