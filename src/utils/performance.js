import { memo, useMemo, useCallback } from 'react';

/**
 * Оптимізований memo з глибоким порівнянням для складних пропсів
 */
export const deepMemo = (Component, customCompare) => {
  return memo(Component, customCompare || ((prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  }));
};

/**
 * Хук для мемоізації складних обчислень
 */
export const useDeepMemo = (factory, deps) => {
  return useMemo(factory, deps?.map(dep => 
    typeof dep === 'object' ? JSON.stringify(dep) : dep
  ));
};

/**
 * Оптимізований useCallback з глибокими залежностями
 */
export const useDeepCallback = (callback, deps) => {
  return useCallback(callback, deps?.map(dep => 
    typeof dep === 'object' ? JSON.stringify(dep) : dep
  ));
};

/**
 * Debounce функція для оптимізації подій
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

/**
 * Throttle функція для обмеження частоти викликів
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Lazy loading для компонентів
 */
export const createLazyComponent = (importFunc, fallback = null) => {
  const LazyComponent = React.lazy(importFunc);
  
  return (props) => (
    <React.Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

/**
 * Intersection Observer хук для lazy loading
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1, ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, options]);

  return [setElement, isIntersecting];
};

/**
 * Оптимізація рендерингу списків
 */
export const optimizeListRendering = (items, renderItem, keyExtractor) => {
  return useMemo(() => {
    return items.map((item, index) => {
      const key = keyExtractor ? keyExtractor(item, index) : index;
      return (
        <div key={key}>
          {renderItem(item, index)}
        </div>
      );
    });
  }, [items, renderItem, keyExtractor]);
};

/**
 * Batch updates для React 18
 */
export const batchUpdates = (updates) => {
  if (typeof ReactDOM?.unstable_batchedUpdates === 'function') {
    ReactDOM.unstable_batchedUpdates(() => {
      updates.forEach(update => update());
    });
  } else {
    // React 18 автоматично батчить оновлення
    updates.forEach(update => update());
  }
};

/**
 * Мемоізація для API викликів
 */
const apiCache = new Map();

export const memoizeApiCall = (apiCall, cacheKey, ttl = 5 * 60 * 1000) => {
  return async (...args) => {
    const key = `${cacheKey}_${JSON.stringify(args)}`;
    const cached = apiCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    
    const result = await apiCall(...args);
    apiCache.set(key, { data: result, timestamp: Date.now() });
    
    return result;
  };
};

/**
 * Очищення кешу API
 */
export const clearApiCache = (pattern) => {
  if (pattern) {
    for (const key of apiCache.keys()) {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    }
  } else {
    apiCache.clear();
  }
};