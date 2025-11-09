import { useState, useEffect } from 'react';

const useOnlineStatus = (userId) => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  useEffect(() => {
    if (!userId) return;

    // Update own status
    const updateStatus = (online) => {
      const currentUserId = localStorage.getItem('userId');
      if (currentUserId === userId) {
        setIsOnline(online);
        if (!online) {
          setLastSeen(new Date().toLocaleString());
        }
      }
    };

    // Listen for online/offline events
    const handleOnline = () => updateStatus(true);
    const handleOffline = () => updateStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeunload', handleOffline);

    // Set initial status
    updateStatus(navigator.onLine);

    // Heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
      if (navigator.onLine) {
        updateStatus(true);
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeunload', handleOffline);
      clearInterval(heartbeat);
    };
  }, [userId]);

  return { isOnline, lastSeen };
};

export default useOnlineStatus;