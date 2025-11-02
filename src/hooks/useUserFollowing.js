import { apiGet } from '../utils/apiUtils';
import { useState, useEffect, useRef } from 'react';

const followingCache = new Map();
const loadingStates = new Map();
const subscribers = new Map();

export const clearUserFollowingCache = (userId) => {
  followingCache.delete(userId);
};

const useUserFollowing = (userId) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (!userId) {
      setLoading(false);
      return;
    }

    // Check cache first
    if (followingCache.has(userId) && forceRefresh === 0) {
      setFollowing(followingCache.get(userId));
      setLoading(false);
      return;
    }

    // Check if already loading
    if (loadingStates.get(userId)) {
      if (!subscribers.has(userId)) {
        subscribers.set(userId, []);
      }
      subscribers.get(userId).push({ setFollowing, setLoading, isMountedRef });
      return;
    }

    loadingStates.set(userId, true);
    
    const fetchFollowing = async () => {
      try {
        const response = await apiGet(`/user/${userId}/following`);
        const result = await response.json();
        
        const followingData = result.success ? result.data : [];
        
        // Cache the result
        followingCache.set(userId, followingData);
        
        // Update current component
        if (isMountedRef.current) {
          setFollowing(followingData);
          setLoading(false);
        }
        
        // Update all subscribers
        const subs = subscribers.get(userId) || [];
        subs.forEach(({ setFollowing: subSetFollowing, setLoading: subSetLoading, isMountedRef: subIsMountedRef }) => {
          if (subIsMountedRef.current) {
            subSetFollowing(followingData);
            subSetLoading(false);
          }
        });
        
        subscribers.delete(userId);
        
      } catch (error) {
        console.error('Error fetching following:', error);
        
        if (isMountedRef.current) {
          setLoading(false);
        }
        
        const subs = subscribers.get(userId) || [];
        subs.forEach(({ setLoading: subSetLoading, isMountedRef: subIsMountedRef }) => {
          if (subIsMountedRef.current) {
            subSetLoading(false);
          }
        });
        
        subscribers.delete(userId);
      } finally {
        loadingStates.delete(userId);
      }
    };

    fetchFollowing();

    return () => {
      isMountedRef.current = false;
    };
  }, [userId, forceRefresh]);

  const refreshFollowing = () => {
    followingCache.delete(userId);
    setForceRefresh(prev => prev + 1);
  };

  const isFollowing = (targetUserId) => {
    return following.includes(targetUserId);
  };

  return { following, loading, refreshFollowing, isFollowing };
};

export default useUserFollowing;