import { useState, useEffect, useRef } from 'react';

const followersCache = new Map();
const loadingStates = new Map();
const subscribers = new Map();

export const clearUserFollowersCache = (userId) => {
  followersCache.delete(userId);
};

const useUserFollowers = (userId) => {
  const [followers, setFollowers] = useState([]);
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
    if (followersCache.has(userId) && forceRefresh === 0) {
      setFollowers(followersCache.get(userId));
      setLoading(false);
      return;
    }

    // Check if already loading
    if (loadingStates.get(userId)) {
      if (!subscribers.has(userId)) {
        subscribers.set(userId, []);
      }
      subscribers.get(userId).push({ setFollowers, setLoading, isMountedRef });
      return;
    }

    loadingStates.set(userId, true);
    
    const fetchFollowers = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/user/${userId}/followers`);
        const result = await response.json();
        
        const followersData = result.success ? result.data : [];
        
        // Cache the result
        followersCache.set(userId, followersData);
        
        // Update current component
        if (isMountedRef.current) {
          setFollowers(followersData);
          setLoading(false);
        }
        
        // Update all subscribers
        const subs = subscribers.get(userId) || [];
        subs.forEach(({ setFollowers: subSetFollowers, setLoading: subSetLoading, isMountedRef: subIsMountedRef }) => {
          if (subIsMountedRef.current) {
            subSetFollowers(followersData);
            subSetLoading(false);
          }
        });
        
        subscribers.delete(userId);
        
      } catch (error) {
        console.error('Error fetching followers:', error);
        
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

    fetchFollowers();

    return () => {
      isMountedRef.current = false;
    };
  }, [userId, forceRefresh]);

  const refreshFollowers = () => {
    followersCache.delete(userId);
    setForceRefresh(prev => prev + 1);
  };

  return { followers, loading, refreshFollowers };
};

export default useUserFollowers;