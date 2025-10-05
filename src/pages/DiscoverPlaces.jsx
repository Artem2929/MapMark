import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import PostActions from "../components/ui/PostActions.jsx";
import { categoriesService } from "../services/categoriesService.js";
import "./DiscoverPlaces.css";

const DiscoverPlaces = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [postComments, setPostComments] = useState({});
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



  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'щойно';
    if (diffInMinutes < 60) return `${diffInMinutes} хв тому`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} год тому`;
    return `${Math.floor(diffInMinutes / 1440)} дн тому`;
  };

  const handleCommentClick = (postId) => {
    setShowCommentForm(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentTextChange = (postId, text) => {
    setCommentTexts(prev => ({
      ...prev,
      [postId]: text
    }));
  };

  const handleSubmitComment = (postId) => {
    const text = commentTexts[postId]?.trim();
    if (!text) return;

    const newComment = {
      id: Date.now(),
      text,
      timestamp: new Date().toISOString(),
      author: 'Ви'
    };

    setPostComments(prev => ({
      ...prev,
      [postId]: [newComment, ...(prev[postId] || [])]
    }));

    setCommentTexts(prev => ({
      ...prev,
      [postId]: ''
    }));

    setShowCommentForm(prev => ({
      ...prev,
      [postId]: false
    }));
  };

  const handleDeleteComment = (postId, commentId) => {
    setPostComments(prev => ({
      ...prev,
      [postId]: prev[postId]?.filter(comment => comment.id !== commentId) || []
    }));
  };

  const handleBookmarkToggle = (post) => {
    setSavedPosts(prev => {
      const isAlreadySaved = prev.some(p => p.id === post.id);
      let newSavedPosts;
      if (isAlreadySaved) {
        newSavedPosts = prev.filter(p => p.id !== post.id);
      } else {
        newSavedPosts = [...prev, post];
      }
      localStorage.setItem('savedPosts', JSON.stringify(newSavedPosts));
      return newSavedPosts;
    });
  };

  const isPostSaved = (postId) => {
    return savedPosts.some(p => p.id === postId);
  };

  const loadMorePosts = () => {
    setLoading(true);
    setTimeout(() => {
      const newPosts = [];
      setPosts(prev => [...prev, ...newPosts]);
      setPage(prev => prev + 1);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    setPosts([]);
    setPage(2);
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
        if (!loading) {
          loadMorePosts();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

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

  const filteredPosts = selectedSubcategory 
    ? posts.filter(post => post.subcategory === selectedSubcategory)
    : posts.filter(post => post.category === selectedCategory);

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
            {filteredPosts.map(post => (
              <div key={post.id} className="post-item">
              <div className="post-header">
                <Link to={`/profile/${post.authorId}`} className="post-author">
                  <div className="author-avatar">{post.author.charAt(0)}</div>
                  <div className="author-info">
                    <span className="author-name">{post.author}</span>
                    <span className="post-time">{getTimeAgo(post.publishedAt)}</span>
                  </div>
                </Link>
                <button className="post-menu" aria-label="Меню поста">⋯</button>
              </div>
              
              <div className="post-media">
                <img src={post.image} alt={post.title} className="post-image" />
              </div>
              
              <div className="post-content">
                <div className="post-title">
                  <strong>{post.title}</strong>
                </div>
                <div className="post-description">
                  {post.description}
                </div>
                <div className="post-rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < Math.floor(post.rating) ? 'filled' : ''}`}>
                        ⭐
                      </span>
                    ))}
                    <span className="rating-text">{post.rating} ({post.reviews} відгуків)</span>
                  </div>
                </div>
                <div className="post-address">
                  <span className="address-icon">📍</span>
                  <span className="address-text">{post.address}</span>
                </div>
              </div>
              
              <div className="post-actions">
                <div className="post-action-buttons">
                  <button className="post-action-btn like-btn">
                    <span className="post-icon">❤️</span>
                    <span className="post-count">{post.likes}</span>
                  </button>
                  <button className="post-action-btn dislike-btn">
                    <span className="post-icon">👎</span>
                    <span className="post-count">{post.dislikes}</span>
                  </button>
                  <button 
                    className="post-action-btn comment-btn"
                    onClick={() => handleCommentClick(post.id)}
                  >
                    <span className="post-icon">💬</span>
                    <span className="post-count">{(postComments[post.id] || []).length}</span>
                  </button>
                </div>
                <button 
                  className={`post-bookmark-btn ${isPostSaved(post.id) ? 'saved' : ''}`}
                  onClick={() => handleBookmarkToggle(post)}
                >
                  <span>{isPostSaved(post.id) ? '🔖' : '🔖'}</span>
                </button>
              </div>
              
              {showCommentForm[post.id] && (
                <div className="comment-form">
                  <textarea
                    value={commentTexts[post.id] || ''}
                    onChange={(e) => handleCommentTextChange(post.id, e.target.value)}
                    placeholder="Напишіть коментар..."
                    maxLength={500}
                    className="comment-input"
                  />
                  <div className="comment-controls">
                    <span className="char-count">{(commentTexts[post.id] || '').length}/500</span>
                    <button 
                      className="submit-btn"
                      onClick={() => handleSubmitComment(post.id)}
                      disabled={!(commentTexts[post.id] || '').trim()}
                    >
                      Надіслати
                    </button>
                  </div>
                </div>
              )}
              
              {showCommentForm[post.id] && postComments[post.id] && postComments[post.id].length > 0 && (
                <div className="comments-list">
                  {postComments[post.id].map(comment => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <div className="comment-text">{comment.text}</div>
                        <button 
                          className="delete-comment-btn"
                          onClick={() => handleDeleteComment(post.id, comment.id)}
                        >
                          ×
                        </button>
                      </div>
                      <div className="comment-timestamp">{getTimeAgo(comment.timestamp)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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