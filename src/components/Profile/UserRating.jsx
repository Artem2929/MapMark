import React, { useState, useEffect } from 'react';
import './UserRating.css';

const UserRating = ({ userId, isOwnProfile = false }) => {
  const [rating, setRating] = useState(0);
  const [userVote, setUserVote] = useState(0);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    loadRating();
  }, [userId]);

  const loadRating = async () => {
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
    if (isOwnProfile || isVoting) return;
    
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
    const starRating = Math.max(0, Math.min(5, (rating + 50) / 20)); // Конвертуємо рейтинг в зірки
    
    for (let i = 0; i < maxStars; i++) {
      const isFilled = i < Math.floor(starRating);
      const isHalf = i === Math.floor(starRating) && starRating % 1 >= 0.5;
      
      stars.push(
        <span 
          key={i} 
          className={`user-rating__star ${
            isFilled ? 'filled' : isHalf ? 'half' : 'empty'
          }`}
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
      
      {!isOwnProfile && (
        <div className="user-rating__controls">
          <button
            className={`user-rating__btn user-rating__btn--plus ${userVote === 1 ? 'active' : ''}`}
            onClick={() => handleVote(1)}
            disabled={isVoting}
            title="Підняти рейтинг"
          >
            +
          </button>
          <button
            className={`user-rating__btn user-rating__btn--minus ${userVote === -1 ? 'active' : ''}`}
            onClick={() => handleVote(-1)}
            disabled={isVoting}
            title="Знизити рейтинг"
          >
            −
          </button>
        </div>
      )}
    </div>
  );
};

export default UserRating;