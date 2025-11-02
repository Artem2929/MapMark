import { useEffect, useRef } from 'react';

const InfiniteScroll = ({ 
  hasMore, 
  loading, 
  onLoadMore, 
  threshold = 100,
  children 
}) => {
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    observer.observe(sentinel);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, onLoadMore, threshold]);

  return (
    <>
      {children}
      <div ref={sentinelRef} style={{ height: '1px' }} />
    </>
  );
};

export default InfiniteScroll;