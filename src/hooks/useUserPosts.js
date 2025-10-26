import { useState, useEffect, useRef } from 'react';

const postsCache = new Map();
const loadingStates = new Map();
const subscribers = new Map();

export const clearUserPostsCache = (userId) => {
  postsCache.delete(userId);
};

const useUserPosts = (userId) => {
  const [posts, setPosts] = useState([]);
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
    if (postsCache.has(userId) && forceRefresh === 0) {
      setPosts(postsCache.get(userId));
      setLoading(false);
      return;
    }

    // Check if already loading
    if (loadingStates.get(userId)) {
      if (!subscribers.has(userId)) {
        subscribers.set(userId, []);
      }
      subscribers.get(userId).push({ setPosts, setLoading, isMountedRef });
      return;
    }

    loadingStates.set(userId, true);
    
    const fetchPosts = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/posts/${userId}`);
        const result = await response.json();
        
        const postsData = result.success ? (result.posts || []) : [];
        
        // Cache the result
        postsCache.set(userId, postsData);
        
        // Update current component
        if (isMountedRef.current) {
          setPosts(postsData);
          setLoading(false);
        }
        
        // Update all subscribers
        const subs = subscribers.get(userId) || [];
        subs.forEach(({ setPosts: subSetPosts, setLoading: subSetLoading, isMountedRef: subIsMountedRef }) => {
          if (subIsMountedRef.current) {
            subSetPosts(postsData);
            subSetLoading(false);
          }
        });
        
        subscribers.delete(userId);
        
      } catch (error) {
        console.error('Error fetching posts:', error);
        
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

    fetchPosts();

    return () => {
      isMountedRef.current = false;
    };
  }, [userId, forceRefresh]);

  const refreshPosts = () => {
    postsCache.delete(userId);
    setForceRefresh(prev => prev + 1);
  };

  return { posts, loading, refreshPosts, postsCount: posts.length };
};

export default useUserPosts;