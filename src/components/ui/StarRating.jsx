import React, { useState } from 'react';
import './StarRating.css';

const StarRating = ({ value = 0, onChange, size = 32, readonly = false }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  const currentValue = hoverValue || value;

  return (
    <div className="star-rating-component" style={{ fontSize: `${size}px` }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= currentValue ? 'filled' : 'empty'} ${!readonly ? 'interactive' : ''}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
        >
          ⭐
        </span>
      ))}
    </div>
  );
};

export default StarRating;