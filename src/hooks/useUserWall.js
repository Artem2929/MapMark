import { apiGet } from '../utils/apiUtils';
import { useState, useEffect, useRef } from 'react';

const wallCache = new Map();
const loadingStates = new Map();
const subscribers = new Map();

export const clearUserWallCache = (userId) => {
  wallCache.delete(userId);
};

const useUserWall = (userId, currentUserId) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(0);
  const isMountedRef = useRef(true);

  const cacheKey = `${userId}-${currentUserId}`;

  useEffect(() => {
    isMountedRef.current = true;
    
    if (!userId) {
      setLoading(false);
      return;
    }

    // Check cache first
    if (wallCache.has(cacheKey) && forceRefresh === 0) {
      setPosts(wallCache.get(cacheKey));
      setLoading(false);
      return;
    }

    // Check if already loading
    if (loadingStates.get(cacheKey)) {
      if (!subscribers.has(cacheKey)) {
        subscribers.set(cacheKey, []);
      }
      subscribers.get(cacheKey).push({ setPosts, setLoading, isMountedRef });
      return;
    }

    loadingStates.set(cacheKey, true);
    
    const fetchWall = async () => {
      try {
        const timestamp = Date.now();
        const url = currentUserId 
          ? `http://localhost:3001/api/user/${userId}/wall?currentUserId=${currentUserId}&t=${timestamp}`
          : `http://localhost:3001/api/user/${userId}/wall?t=${timestamp}`;
          
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('Wall API response:', result);
        const wallData = result.success ? result.data : [];
        
        // Cache the result
        wallCache.set(cacheKey, wallData);
        
        // Update current component
        if (isMountedRef.current) {
          console.log('Setting posts:', wallData);
          setPosts(wallData);
          setLoading(false);
        }
        
        // Update all subscribers
        const subs = subscribers.get(cacheKey) || [];
        subs.forEach(({ setPosts: subSetPosts, setLoading: subSetLoading, isMountedRef: subIsMountedRef }) => {
          if (subIsMountedRef.current) {
            subSetPosts(wallData);
            subSetLoading(false);
          }
        });
        
        subscribers.delete(cacheKey);
        
      } catch (error) {
        console.error('Error fetching wall:', error);
        
        if (isMountedRef.current) {
          setLoading(false);
        }
        
        const subs = subscribers.get(cacheKey) || [];
        subs.forEach(({ setLoading: subSetLoading, isMountedRef: subIsMountedRef }) => {
          if (subIsMountedRef.current) {
            subSetLoading(false);
          }
        });
        
        subscribers.delete(cacheKey);
      } finally {
        loadingStates.delete(cacheKey);
      }
    };

    fetchWall();

    return () => {
      isMountedRef.current = false;
    };
  }, [userId, currentUserId, forceRefresh, cacheKey]);

  const refreshWall = () => {
    // Clear all related cache entries
    for (const key of wallCache.keys()) {
      if (key.startsWith(userId)) {
        wallCache.delete(key);
      }
    }
    setForceRefresh(prev => prev + 1);
  };

  const addPost = (newPost) => {
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    wallCache.set(cacheKey, updatedPosts);
  };

  return { posts, loading, refreshWall, addPost };
};

export default useUserWall;