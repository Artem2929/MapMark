import React, { memo,  useState, useEffect , useCallback, useMemo } from 'react';
import { classNames } from '../../utils/classNames';
import { useOptimizedState } from '../../hooks/useOptimizedState';
import './UserRating.css';

const UserRating = memo(({  userId, isOwnProfile = false  }) => {
  const [rating, setRating] = useState(0);

UserRating;

.displayName = 'UserRating';
  const [userVote, setUserVote] = useState(0);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    if (userId) {
      loadRating();
    }
  }, [userId]);

  const loadRating = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/rating/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRating(data.rating || 0);
        setUserVote(data.userVote || 0);
      }
    } catch (error) {
      console.error('Error loading rating:', error);
    }
  };

  const handleVote = async (vote) => {
    if (isOwnProfile || isVoting || !userId) return;
    
    setIsVoting(true);
    
    try {
      const response = await fetch(`http://localhost:3001/api/rating/${userId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vote })
      });
      
      if (response.ok) {
        const data = await response.json();
        setRating(data.rating);
        setUserVote(vote);
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const getRatingColor = () => {
    if (rating > 0) return '#4CAF50';
    if (rating < 0) return '#F44336';
    return '#757575';
  };

  const getRatingText = () => {
    if (rating > 0) return `+${rating}`;
    return rating.toString();
  };

  const renderStars = () => {
    const stars = [];
    const maxStars = 5;
    
    for (let i = 0; i < maxStars; i++) {
      const starThreshold = (i + 1) * 500; // 500 балів = 1 зірка
      const prevThreshold = i * 500;
      
      let starClass = 'empty';
      if (rating >= starThreshold) {
        starClass = 'filled';
      } else if (rating > prevThreshold) {
        const progress = (rating - prevThreshold) / 500;
        starClass = progress >= 0.5 ? 'half' : 'partial';
      }
      
      stars.push(
        <span 
          key={i} 
          className={`user-rating__star ${starClass}`}
          style={starClass === 'partial' ? {
            background: `linear-gradient(90deg, #fbbf24 ${((rating - prevThreshold) / 500) * 100}%, #e5e7eb ${((rating - prevThreshold) / 500) * 100}%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          } : {}}
        >
          ★
        </span>
      );
    }
    
    return stars;
  };

  return (
    <div className="user-rating">
      <div className="user-rating__header">
        <span className="user-rating__label">Рейтинг:</span>
      </div>
      
      <div className="user-rating__stars">
        {renderStars()}
        <span className="user-rating__value">{getRatingText()}</span>
      </div>
      

    </div>
  );
};

export default UserRating;