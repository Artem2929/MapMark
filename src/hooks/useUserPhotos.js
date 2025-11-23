import { apiGet } from '../utils/apiUtils';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const photosCache = new Map();
const loadingStates = new Map();
const subscribers = new Map();

export const clearUserPhotosCache = (userId) => {
  photosCache.delete(userId);
};

const useUserPhotos = (userId) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(0);
  const isMountedRef = useRef(true);
  const location = useLocation();

  useEffect(() => {
    isMountedRef.current = true;
    
    if (!userId) {
      setLoading(false);
      return;
    }

    // Check cache first
    if (photosCache.has(userId) && forceRefresh === 0) {
      setPhotos(photosCache.get(userId));
      setLoading(false);
      return;
    }

    // Check if already loading
    if (loadingStates.get(userId)) {
      if (!subscribers.has(userId)) {
        subscribers.set(userId, []);
      }
      subscribers.get(userId).push({ setPhotos, setLoading, isMountedRef });
      return;
    }

    loadingStates.set(userId, true);
    
    const fetchPhotos = async () => {
      try {
        const response = await apiGet(`/photos/user/${userId}`);
        const result = await response.json();
        
        const photosData = result.success ? result.data : [];
        
        // Cache the result
        photosCache.set(userId, photosData);
        
        // Update current component
        if (isMountedRef.current) {
          setPhotos(photosData);
          setLoading(false);
        }
        
        // Update all subscribers
        const subs = subscribers.get(userId) || [];
        subs.forEach(({ setPhotos: subSetPhotos, setLoading: subSetLoading, isMountedRef: subIsMountedRef }) => {
          if (subIsMountedRef.current) {
            subSetPhotos(photosData);
            subSetLoading(false);
          }
        });
        
        subscribers.delete(userId);
        
      } catch (error) {
        console.error('Error fetching photos:', error);
        
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

    fetchPhotos();

    return () => {
      isMountedRef.current = false;
    };
  }, [userId, forceRefresh]);

  // Refresh photos when navigating to profile page
  useEffect(() => {
    if (userId && location.pathname.includes('/profile') && isMountedRef.current) {
      // Clear cache and refresh photos when navigating to profile
      photosCache.delete(userId);
      setForceRefresh(prev => prev + 1);
    }
  }, [location.pathname, userId]);

  // Add listeners to refresh photos when returning to page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userId && isMountedRef.current) {
        // Clear cache and refresh photos when page becomes visible
        photosCache.delete(userId);
        setForceRefresh(prev => prev + 1);
      }
    };

    const handleFocus = () => {
      if (userId && isMountedRef.current) {
        // Clear cache and refresh photos when window gains focus
        photosCache.delete(userId);
        setForceRefresh(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [userId]);

  const refreshPhotos = () => {
    photosCache.delete(userId);
    setForceRefresh(prev => prev + 1);
  };

  const addPhoto = (newPhoto) => {
    const updatedPhotos = [...photos, newPhoto];
    setPhotos(updatedPhotos);
    photosCache.set(userId, updatedPhotos);
  };

  return { photos, loading, refreshPhotos, addPhoto };
};

export default useUserPhotos;