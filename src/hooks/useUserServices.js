import { useState, useEffect, useRef } from 'react';
import { apiGet } from '../utils/apiUtils';

const servicesCache = new Map();
const loadingStates = new Map();
const subscribers = new Map();

export const clearUserServicesCache = (userId) => {
  servicesCache.delete(userId);
};

const useUserServices = (userId) => {
  const [services, setServices] = useState([]);
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
    if (servicesCache.has(userId) && forceRefresh === 0) {
      setServices(servicesCache.get(userId));
      setLoading(false);
      return;
    }

    // Check if already loading
    if (loadingStates.get(userId)) {
      if (!subscribers.has(userId)) {
        subscribers.set(userId, []);
      }
      subscribers.get(userId).push({ setServices, setLoading, isMountedRef });
      return;
    }

    loadingStates.set(userId, true);
    
    const fetchServices = async () => {
      try {
        const response = await apiGet(`/services/user/${userId}`);
        const result = await response.json();
        
        const servicesData = result.success ? result.data : [];
        
        // Cache the result
        servicesCache.set(userId, servicesData);
        
        // Update current component
        if (isMountedRef.current) {
          setServices(servicesData);
          setLoading(false);
        }
        
        // Update all subscribers
        const subs = subscribers.get(userId) || [];
        subs.forEach(({ setServices: subSetServices, setLoading: subSetLoading, isMountedRef: subIsMountedRef }) => {
          if (subIsMountedRef.current) {
            subSetServices(servicesData);
            subSetLoading(false);
          }
        });
        
        subscribers.delete(userId);
        
      } catch (error) {
        console.error('Error fetching services:', error);
        
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

    fetchServices();

    return () => {
      isMountedRef.current = false;
    };
  }, [userId, forceRefresh]);

  const refreshServices = () => {
    servicesCache.delete(userId);
    setForceRefresh(prev => prev + 1);
  };

  const addService = (newService) => {
    const updatedServices = [...services, newService];
    setServices(updatedServices);
    servicesCache.set(userId, updatedServices);
  };

  return { services, loading, refreshServices, addService };
};

export default useUserServices;