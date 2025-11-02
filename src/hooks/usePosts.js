import { useState, useEffect } from 'react';

const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/posts?page=${pageNum}&limit=10`);
      const data = await response.json();

      if (data.success) {
        if (reset) {
          setPosts(data.posts);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
        }
        setHasMore(data.posts.length === 10);
      } else {
        setError(data.error || 'Помилка завантаження постів');
      }
    } catch (err) {
      setError('Помилка мережі');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  const refresh = () => {
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
  };

  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
};

export default usePosts;