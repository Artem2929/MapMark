import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import PostCard from "../components/ui/PostCard.jsx";
import InfiniteScroll from "../components/ui/InfiniteScroll.jsx";
import LoadingSkeleton from "../components/ui/LoadingSkeleton.jsx";
import usePosts from "../hooks/usePosts.js";
import { categoriesService } from "../services/categoriesService.js";
import "./DiscoverPlaces.css";

const DiscoverPlaces = () => {
  const { t } = useTranslation();
  const { posts, loading, error, hasMore, initialLoading, loadMore, refresh } = usePosts();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [savedPosts, setSavedPosts] = useState([]);
  const scrollRef = useRef(null);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const data = await categoriesService.getCategories();
      setCategories(data);
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };





  const handleReaction = async (postId, reactionType) => {
    try {
      const response = await fetch(`http://localhost:3001/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'temp-user-id', // TODO: замінити на реальний ID користувача
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

  const handleComment = (postId, comment) => {
    console.log('Comment on post:', postId, comment);
  };

  const handleShare = (postId) => {
    console.log('Share post:', postId);
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedPosts') || '[]');
    setSavedPosts(saved);
    loadCategories();
    
    const handleLanguageChange = () => {
      categoriesService.clearCache();
      loadCategories();
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, []);



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
        
        <div className="categories-section">
          {categoriesLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Завантаження категорій...</p>
            </div>
          ) : (
            <div className="categories-scroll">
              {Array.isArray(categories) && categories.map(category => (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => {
                    if (selectedCategory === category.id) {
                      setShowSubcategories(!showSubcategories);
                    } else {
                      setSelectedCategory(category.id);
                      setSelectedSubcategory('');
                      setShowSubcategories(true);
                    }
                  }}
                >
                  <span className="category-emoji">{category.emoji}</span>
                  <span className="category-name">{t(`categories.${category.id}`, category.name)}</span>
                </button>
              ))}
            </div>
          )}
          
          {showSubcategories && categories.find(cat => cat.id === selectedCategory)?.subcategories?.length > 0 && (
            <div className="subcategories-section">
              <h4>Підкатегорії:</h4>
              <div className="subcategories-scroll">
                <button
                  className={`subcategory-btn ${!selectedSubcategory ? 'active' : ''}`}
                  onClick={() => setSelectedSubcategory('')}
                >
                  Всі
                </button>
                {categories.find(cat => cat.id === selectedCategory)?.subcategories.map(subcategory => (
                  <button
                    key={subcategory.id}
                    className={`subcategory-btn ${selectedSubcategory === subcategory.id ? 'active' : ''}`}
                    onClick={() => setSelectedSubcategory(subcategory.id)}
                  >
                    {t(`subcategories.${subcategory.id}`, subcategory.name)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {savedPosts.length > 0 && (
          <button 
            className="saved-posts-btn"
            onClick={() => window.location.href = '/saved-posts'}
          >
            <span>📚</span>
            <span>Мої збереження</span>
            <span className="saved-count">{savedPosts.length}</span>
          </button>
        )}
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
                <p>Поки що немає постів</p>
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