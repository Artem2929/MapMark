import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import PostCard from "../components/ui/PostCard.jsx";
import usePosts from "../hooks/usePosts.js";
import { categoriesService } from "../services/categoriesService.js";
import "./DiscoverPlaces.css";

const DiscoverPlaces = () => {
  const { t } = useTranslation();
  const { posts, loading, error, hasMore, loadMore, refresh } = usePosts();
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





  const handleLike = (postId) => {
    console.log('Like post:', postId);
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

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        if (!loading && hasMore) {
          loadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, loadMore]);

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
          {/* Бічна панель фільтрів */}
          <div className="sidebar-filters">
            <h3>Фільтри</h3>
            
            <div className="filter-group">
              <label>Категорія</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('');
                }}
                className="filter-select"
              >
                {Array.isArray(categories) && categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.emoji} {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {showSubcategories && categories.find(cat => cat.id === selectedCategory)?.subcategories?.length > 0 && (
              <div className="filter-group">
                <label>Підкатегорія</label>
                <select 
                  value={selectedSubcategory} 
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Всі підкатегорії</option>
                  {categories.find(cat => cat.id === selectedCategory)?.subcategories.map(subcategory => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="filter-group">
              <label>Рейтинг</label>
              <select className="filter-select">
                <option value="">Всі рейтинги</option>
                <option value="4.5">4.5+ зірок</option>
                <option value="4.0">4.0+ зірок</option>
                <option value="3.5">3.5+ зірок</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Відстань</label>
              <select className="filter-select">
                <option value="">Будь-яка відстань</option>
                <option value="5">До 5 км</option>
                <option value="10">До 10 км</option>
                <option value="25">До 25 км</option>
              </select>
            </div>
          </div>

          <div className="places-feed">
            {error && (
              <div className="error-message">
                <p>Помилка: {error}</p>
                <button onClick={refresh} className="retry-btn">Спробувати знову</button>
              </div>
            )}
            
            {!error && posts.length === 0 && !loading && (
              <div className="empty-feed">
                <p>Поки що немає постів</p>
              </div>
            )}
            
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
              />
            ))}
            
            {loading && (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Завантаження...</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default DiscoverPlaces;