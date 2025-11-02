import { useState, useEffect, useCallback, useRef } from 'react';

const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const loadingRef = useRef(false);

  const fetchPosts = useCallback(async (pageNum = 1, reset = false) => {
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/posts?page=${pageNum}&limit=5`);
      const data = await response.json();

      if (data.success) {
        if (reset) {
          setPosts(data.posts);
        } else {
          setPosts(prev => {
            // Уникаємо дублювання
            const existingIds = new Set(prev.map(p => p.id));
            const newPosts = data.posts.filter(p => !existingIds.has(p.id));
            return [...prev, ...newPosts];
          });
        }
        setHasMore(data.hasMore);
      } else {
        setError(data.error || 'Помилка завантаження постів');
      }
    } catch (err) {
      setError('Помилка мережі');
      console.error('Error fetching posts:', err);
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