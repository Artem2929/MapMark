import React, { useState, useEffect } from 'react';
import './FollowButton.css';

const FollowButton = ({ userId, targetUserId }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFollowStatus();
  }, [userId, targetUserId]);

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/user/${userId}/following`);
      const result = await response.json();
      if (result.success) {
        setIsFollowing(result.data.includes(targetUserId));
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/user/${userId}/follow/${targetUserId}`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        setIsFollowing(result.data.isFollowing);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      className={`follow-button ${isFollowing ? 'following' : 'not-following'}`}
      onClick={handleFollowToggle}
      disabled={loading}
    >
      {loading ? '...' : isFollowing ? 'Відписатися' : 'Підписатися'}
    </button>
  );
};

export default FollowButton;