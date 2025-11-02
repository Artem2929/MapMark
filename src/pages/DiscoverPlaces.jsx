import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { Link } from "react-router-dom";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import PostCard from "../components/ui/PostCard.jsx";
import InfiniteScroll from "../components/ui/InfiniteScroll.jsx";
import LoadingSkeleton from "../components/ui/LoadingSkeleton.jsx";
import usePosts from "../hooks/usePosts.js";

import apiClient from "../utils/apiClient.js";
import "./DiscoverPlaces.css";

const DiscoverPlaces = () => {
  const { t } = useTranslation();
  const { posts, loading, error, hasMore, initialLoading, loadMore, refresh } = usePosts();

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);







  const handleReaction = async (postId, reactionType) => {
    try {
      const data = await apiClient.post(`/posts/${postId}/reactions`, {
        type: reactionType
      });
      return data;
    } catch (error) {
      console.error('Error handling reaction:', error);
      throw error;
    }
  };

  const handleComment = (postId, comment) => {
    console.log('Comment on post:', postId, comment);
  };

  const handleShare = (postId) => {
    console.log('Share post:', postId);
  };

  const handleSave = async (postId, shouldSave) => {
    try {
      const data = await apiClient.post(`/posts/${postId}/save`);
      return data;
    } catch (error) {
      console.error('Error saving post:', error);
      throw error;
    }
  };





  const scrollCategories = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    
    const scrollAmount = 150;
    
    if (direction === 'left') {
      container.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    } else {
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // Always enable both buttons for infinite scroll
    setCanScrollLeft(true);
    setCanScrollRight(true);
  }, []);



  const breadcrumbItems = [
    { label: t('header.home'), link: '/' },
    { label: t('header.discover') }
  ];

  return (
    <div className="page-container discover-places">
      <div className="discover-container">
        <Breadcrumbs items={breadcrumbItems} />
        

        

        <div className="discover-content-container">
          <div className="places-feed">
            {error && (
              <div className="error-message">
                <p>Помилка: {error}</p>
                <button onClick={refresh} className="retry-btn">Спробувати знову</button>
              </div>
            )}
            
            {!error && posts.length === 0 && !initialLoading && (
              <div className="empty-feed">
                <div className="empty-icon">📍</div>
                <h3>Поки що немає постів</h3>
                <p>Будьте першим, хто поділиться своїми враженнями!</p>
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
                {posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onReaction={handleReaction}
                    onComment={handleComment}
                    onShare={handleShare}
                    onSave={handleSave}
                  />
                ))}
                
                {loading && <LoadingSkeleton count={2} />}
                
                {!hasMore && posts.length > 0 && (
                  <div className="no-more-posts">
                    <p>Всі пости завантажені</p>
                  </div>
                )}
              </InfiniteScroll>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default DiscoverPlaces;