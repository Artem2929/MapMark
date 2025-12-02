import React, { memo, useState, useEffect } from 'react';
import { classNames } from '../../utils/classNames';
import { useOptimizedState } from '../../hooks/useOptimizedState';
import useUserFollowing from '../../hooks/useUserFollowing';
import './FollowButton.css';

const FollowButton = memo(({  userId, targetUserId  }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkFollowingStatus = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/user/${userId}/following/${targetUserId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        const result = await response.json();
        if (result.success) {
          setIsFollowing(result.isFollowing);
        }
      } catch (error) {
        console.error('Error checking following status:', error);
      }
    };
    
    if (userId && targetUserId) {
      checkFollowingStatus();
    }
  }, [userId, targetUserId]);

  const handleFollowToggle = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/user/${userId}/follow/${targetUserId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      
      if (result.success) {
        const newFollowingState = !isFollowing;
        setIsFollowing(newFollowingState);
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
});

FollowButton.displayName = 'FollowButton';

export default FollowButton;