import React, { useEffect, useRef, useCallback, memo } from 'react';

const InfiniteScroll = memo(({  
  hasMore, 
  loading, 
  onLoadMore, 
  threshold = 100,
  children 
 }) => {
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasMore && !loading && !loadingRef.current) {
      loadingRef.current = true;
      onLoadMore();
      setTimeout(() => {
        loadingRef.current = false;
      }, 1000);
    }
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: `${threshold}px`,
      threshold: 0.1
    });

    observer.observe(sentinel);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold]);

  return (
    <>
      {children}
      <div ref={sentinelRef} style={{ height: '1px' }} />
    </>
  );
});

InfiniteScroll.displayName = 'InfiniteScroll';

export default InfiniteScroll;