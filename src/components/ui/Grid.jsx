import React, { memo } from 'react';
import { classNames } from '../../utils/classNames';
import './Grid.css';

const Grid = memo(({  
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

Grid.displayName = 'Grid';

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
};

export default Grid;