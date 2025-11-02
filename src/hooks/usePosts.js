import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../utils/apiClient.js';

const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const loadingRef = useRef(false);
  const retryCountRef = useRef(0);

  const fetchPosts = useCallback(async (pageNum = 1, reset = false) => {
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      const timeoutId = setTimeout(() => {
        throw new Error('Запит перервано через тайм-аут');
      }, 10000);

      const data = await apiClient.get('/posts', {
        page: pageNum,
        limit: 5
      });
      
      clearTimeout(timeoutId);

      if (data.success) {
        if (reset) {
          setPosts(data.posts);
        } else {
          setPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newPosts = data.posts.filter(p => !existingIds.has(p.id));
            return [...prev, ...newPosts];
          });
        }
        setHasMore(data.hasMore);
        retryCountRef.current = 0;
      } else {
        throw new Error(data.error || 'Помилка завантаження постів');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Запит перервано через тайм-аут');
      } else if (retryCountRef.current < 3) {
        retryCountRef.current += 1;
        setTimeout(() => fetchPosts(pageNum, reset), 1000 * retryCountRef.current);
        return;
      } else {
        setError(err.message || 'Помилка мережі');
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
      loadingRef.current = false;
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && !loadingRef.current) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, false);
    }
  }, [loading, hasMore, page, fetchPosts]);

  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
    fetchPosts(1, true);
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    initialLoading,
    loadMore,
    refresh
  };
};

export default usePosts;