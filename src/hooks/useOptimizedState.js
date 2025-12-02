import { useState, useCallback, useRef } from 'react';

/**
 * Оптимізований хук для стану з debounce та optimistic updates
 */
export const useOptimizedState = (initialValue, options = {}) => {
  const { 
    debounceMs = 0,
    optimistic = false,
    onUpdate,
    validator 
  } = options;

  const [value, setValue] = useState(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);
  const timeoutRef = useRef(null);
  const previousValueRef = useRef(initialValue);

  const updateValue = useCallback(async (newValue, skipValidation = false) => {
    // Валідація
    if (!skipValidation && validator && !validator(newValue)) {
      return false;
    }

    // Optimistic update
    if (optimistic) {
      previousValueRef.current = value;
      setValue(newValue);
    }

    setIsUpdating(true);

    try {
      if (onUpdate) {
        const result = await onUpdate(newValue);
        if (result?.success) {
          setValue(result.value || newValue);
          return true;
        } else {
          // Rollback on failure
          if (optimistic) {
            setValue(previousValueRef.current);
          }
          return false;
        }
      } else {
        setValue(newValue);
        return true;
      }
    } catch (error) {
      // Rollback on error
      if (optimistic) {
        setValue(previousValueRef.current);
      }
      console.error('State update error:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [value, optimistic, onUpdate, validator]);

  const debouncedUpdate = useCallback((newValue) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (debounceMs > 0) {
      timeoutRef.current = setTimeout(() => {
        updateValue(newValue);
      }, debounceMs);
    } else {
      updateValue(newValue);
    }
  }, [updateValue, debounceMs]);

  return [value, debouncedUpdate, { isUpdating, updateValue }];
};

/**
 * Хук для оптимізованого списку з пагінацією
 */
export const useOptimizedList = (initialItems = [], options = {}) => {
  const {
    pageSize = 10,
    onLoadMore,
    onRefresh,
    keyExtractor = (item, index) => item.id || index
  } = options;

  const [items, setItems] = useState(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !onLoadMore) return;

    setIsLoading(true);
    try {
      const result = await onLoadMore(page, pageSize);
      if (result?.items) {
        setItems(prev => [...prev, ...result.items]);
        setHasMore(result.hasMore ?? result.items.length === pageSize);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, onLoadMore, page, pageSize]);

  const refresh = useCallback(async () => {
    if (isLoading || !onRefresh) return;

    setIsLoading(true);
    try {
      const result = await onRefresh();
      if (result?.items) {
        setItems(result.items);
        setHasMore(result.hasMore ?? result.items.length === pageSize);
        setPage(2); // Next page after refresh
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, onRefresh, pageSize]);

  const updateItem = useCallback((id, updater) => {
    setItems(prev => prev.map(item => {
      const itemId = keyExtractor(item);
      return itemId === id ? 
        (typeof updater === 'function' ? updater(item) : updater) : 
        item;
    }));
  }, [keyExtractor]);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(item => keyExtractor(item) !== id));
  }, [keyExtractor]);

  const addItem = useCallback((item, position = 'end') => {
    setItems(prev => position === 'start' ? [item, ...prev] : [...prev, item]);
  }, []);

  return {
    items,
    isLoading,
    hasMore,
    loadMore,
    refresh,
    updateItem,
    removeItem,
    addItem,
    setItems
  };
};