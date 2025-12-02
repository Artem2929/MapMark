import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { classNames } from '../../utils/classNames';
import { useIntersectionObserver } from '../../utils/performance';

/**
 * Віртуалізований список для оптимізації великих списків
 */
const VirtualList = memo(({
  items = [],
  renderItem,
  itemHeight = 100,
  containerHeight = 400,
  overscan = 5,
  onLoadMore,
  hasMore = false,
  loading = false,
  keyExtractor = (item, index) => item.id || index,
  className = '',
  ...props
}) => {
  
  const [scrollTop, setScrollTop] = useState(0);

VirtualList.displayName = 'VirtualList';
  const [containerRef, setContainerRef] = useState(null);
  
  // Обчислення видимих елементів
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);
  
  // Видимі елементи
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      key: keyExtractor(item, startIndex + index)
    }));
  }, [items, visibleRange, keyExtractor]);
  
  // Обробник скролу
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
    
    // Перевірка чи потрібно завантажити більше
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    
    if (isNearBottom && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);
  
  // Intersection Observer для автозавантаження
  const [loadMoreRef, isLoadMoreVisible] = useIntersectionObserver({
    threshold: 0.1
  });
  
  useEffect(() => {
    if (isLoadMoreVisible && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  }, [isLoadMoreVisible, hasMore, loading, onLoadMore]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;
  
  return (
    <div
      ref={setContainerRef}
      className={`virtual-list ${className}`}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
      {...props}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, index, key }) => (
            <div
              key={key}
              style={{ height: itemHeight }}
              className="virtual-list__item"
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
        
        {/* Load more trigger */}
        {hasMore && (
          <div
            ref={loadMoreRef}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 1,
            }}
          />
        )}
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="virtual-list__loading">
          <div className="spinner" />
          <span>Завантаження...</span>
        </div>
      )}
    </div>
  );
});

VirtualList.displayName = 'VirtualList';

export default VirtualList;