import { useState, useEffect, useRef } from 'react';
import { apiGet } from '../utils/apiUtils';

const profileCache = new Map();
const loadingStates = new Map();
const subscribers = new Map();

// Function to clear cache for a specific user
export const clearUserProfileCache = (userId) => {
  profileCache.delete(userId);
};

const useUserProfile = (userId) => {
  const [forceRefresh, setForceRefresh] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (!userId) {
      setLoading(false);
      return;
    }

    if (profileCache.has(userId) && forceRefresh === 0) {
      setUser(profileCache.get(userId));
      setLoading(false);
      return;
    }



    if (loadingStates.get(userId)) {
      if (!subscribers.has(userId)) {
        subscribers.set(userId, []);
      }
      subscribers.get(userId).push({ setUser, setLoading, isMountedRef });
      return;
    }

    loadingStates.set(userId, true);
    
    const fetchProfile = async () => {
      try {
        const response = await apiGet(`/user/${userId}/profile`);
        const data = await response.json();
        
        const userData = data.success ? data.data : null;
        
        profileCache.set(userId, userData);
        
        if (isMountedRef.current) {
          setUser(userData);
          setLoading(false);
        }
        
        const subs = subscribers.get(userId) || [];
        subs.forEach(({ setUser: subSetUser, setLoading: subSetLoading, isMountedRef: subIsMountedRef }) => {
          if (subIsMountedRef.current) {
            subSetUser(userData);
            subSetLoading(false);
          }
        });
        
        subscribers.delete(userId);
        
      } catch (error) {
        console.error('Error fetching user profile:', error);
        
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

    fetchProfile();

    return () => {
      isMountedRef.current = false;
    };
  }, [userId, forceRefresh]);

  const refreshProfile = () => {
    profileCache.delete(userId);
    setForceRefresh(prev => prev + 1);
  };

  return { user, loading, refreshProfile };
};

export default useUserProfile;