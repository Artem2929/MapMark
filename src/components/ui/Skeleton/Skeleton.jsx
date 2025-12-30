import React, { memo } from 'react'
import './Skeleton.css'

const Skeleton = memo(({ width, height, className = '', variant = 'rectangular' }) => {
  return (
    <div 
      className={`skeleton skeleton--${variant} ${className}`}
      style={{ width, height }}
    />
  )
})

Skeleton.displayName = 'Skeleton'

export default Skeleton