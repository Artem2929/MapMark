import React from 'react';
import './Skeleton.css';

const Skeleton = ({ width, height, className = '', variant = 'rectangular' }) => {
  return (
    <div 
      className={`skeleton skeleton--${variant} ${className}`}
      style={{ width, height }}
    />
  );
};

export default Skeleton;