import React from 'react'
import './Skeleton.css'

const Skeleton = ({ width, height, variant = 'rectangular', className = '' }) => {
  const classes = [
    'skeleton',
    variant === 'circular' && 'skeleton--circular',
    variant === 'text' && 'skeleton--text',
    className
  ].filter(Boolean).join(' ')

  return (
    <div 
      className={classes}
      style={{ width, height }}
    />
  )
}

export default Skeleton