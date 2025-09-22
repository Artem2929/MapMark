import React, { useState } from 'react';
import './StarRating.css';

const StarRating = ({ rating = 0, onChange, size = 'medium', readonly = true, isReviewForm = false }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = (starRating) => {
    if (!readonly && onChange) {
      onChange(starRating);
    }
  };

  const handleMouseEnter = (starRating) => {
    if (!readonly) {
      setHoverValue(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  const currentValue = hoverValue || rating;

  const getStarClass = (starIndex) => {
    if (isReviewForm) {
      return starIndex <= currentValue ? 'filled' : '';
    }
    const diff = currentValue - starIndex + 1;
    if (diff >= 1) {
      return 'star-filled';
    } else if (diff >= 0.5) {
      return 'star-half';
    }
    return 'star-empty';
  };

  if (isReviewForm) {
    return (
      <div className="review-star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`review-star ${getStarClass(star)}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
          >
            ★
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`star-rating ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${getStarClass(star)} ${!readonly ? 'interactive' : ''}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;