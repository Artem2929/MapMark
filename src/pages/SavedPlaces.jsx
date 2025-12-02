import React, { useState, useEffect, useCallback } from 'react';
import { classNames } from '../utils/classNames';
import { useOptimizedState } from '../hooks/useOptimizedState';
import { Link } from 'react-router-dom';
import PostCard from '../components/ui/PostCard';
import InfiniteScroll from '../components/ui/InfiniteScroll';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import './SavedPlaces.css';

const SavedPlaces = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchSavedPosts = useCallback(async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/posts/users/temp-user-id/saved-posts?page=${pageNum}&limit=10`);
      const data = await response.json();

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
      } else {
        setError(data.error || 'Помилка завантаження збережених постів');
      }
    } catch (err) {
      setError('Помилка мережі');
      console.error('Error fetching saved posts:', err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSavedPosts(nextPage, false);
    }
  }, [loading, hasMore, page, fetchSavedPosts]);

  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
    fetchSavedPosts(1, true);
  }, [fetchSavedPosts]);

  const handleReaction = async (postId, reactionType) => {
    try {
      const response = await fetch(`http://localhost:3001/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'temp-user-id',
          type: reactionType
        })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error handling reaction:', error);
      throw error;
    }
  };

  const handleSave = async (postId, shouldSave) => {
    try {
      const response = await fetch(`http://localhost:3001/api/posts/${postId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'temp-user-id'
        })
      });
      
      const data = await response.json();
      
      // Якщо пост видалено зі збережених, видаляємо його зі списку
      if (data.success && !data.saved) {
        setPosts(prev => prev.filter(post => post.id !== postId));
      }
      
      return data;
    } catch (error) {
      console.error('Error saving post:', error);
      throw error;
    }
  };

  const handleComment = (postId, comment) => {
    console.log('Comment on post:', postId, comment);
  };

  const handleShare = (postId) => {
    console.log('Share post:', postId);
  };

  useEffect(() => {
    fetchSavedPosts(1, true);
  }, [fetchSavedPosts]);

  const breadcrumbItems = [
    { label: 'Головна', link: '/' },
    { label: 'Стрічка постів', link: '/discover-places' },
    { label: 'Збережені пости' }
  ];

  return (
    <div className="saved-places-page">
      <div className="saved-places-container">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="saved-places-header">
          <h1>Збережені пости</h1>
          <p>Ваші улюблені місця та враження</p>
        </div>

        <div className="saved-places-content">
          {error && (
            <div className="error-message">
              <p>Помилка: {error}</p>
              <button onClick={refresh} className="retry-btn">Спробувати знову</button>
            </div>
          )}
          
          {!error && posts.length === 0 && !initialLoading && (
            <div className="empty-saved">
              <div className="empty-icon">🔖</div>
              <h3>Поки що немає збережених постів</h3>
              <p>Зберігайте цікаві пости, щоб легко знаходити їх пізніше</p>
              <Link to="/discover-places" className="discover-btn">
                Переглянути стрічку
              </Link>
            </div>
          )}
          
          {initialLoading ? (
            <LoadingSkeleton count={3} />
          ) : (
            <InfiniteScroll
              hasMore={hasMore}
              loading={loading}
              onLoadMore={loadMore}
              threshold={200}
            >
              <div className="saved-posts-grid">
                {posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onReaction={handleReaction}
                    onComment={handleComment}
                    onShare={handleShare}
                    onSave={handleSave}
                    initialSaved={true}
                  />
                ))}
              </div>
              
              {loading && <LoadingSkeleton count={2} />}
              
              {!hasMore && posts.length > 0 && (
                <div className="no-more-posts">
                  <p>Всі збережені пости завантажені</p>
                </div>
              )}
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedPlaces;