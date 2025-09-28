import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";

import PostActions from "../components/ui/PostActions.jsx";
import "./DiscoverPlaces.css";

const DiscoverPlaces = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('realestate');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [postComments, setPostComments] = useState({});
  const [savedPosts, setSavedPosts] = useState([]);
  const scrollRef = useRef(null);

  const categories = [

    { 
      id: 'realestate', 
      name: 'Нерухомість', 
      emoji: '🏠',
      subcategories: [
        { id: 'apartments', name: 'Квартири' },
        { id: 'houses', name: 'Будинки та дачі' },
        { id: 'commercial', name: 'Комерційна нерухомість' },
        { id: 'land', name: 'Земельні ділянки' },
        { id: 'garages', name: 'Гаражі та паркомісця' },
        { id: 'abroad', name: 'Нерухомість за кордоном' }
      ]
    },
    { 
      id: 'transport', 
      name: 'Транспорт', 
      emoji: '🚗',
      subcategories: [
        { id: 'cars', name: 'Легкові авто' },
        { id: 'motorcycles', name: 'Мотоцикли / скутери' },
        { id: 'trucks', name: 'Грузові авто / фургони' },
        { id: 'commercial-transport', name: 'Комерційний транспорт' },
        { id: 'water-transport', name: 'Водний транспорт' },
        { id: 'auto-parts', name: 'Автозапчастини та аксесуари' },
        { id: 'auto-services', name: 'Сервіси та СТО' },
        { id: 'car-rental', name: 'Оренда авто' }
      ]
    },
    { 
      id: 'jobs', 
      name: 'Робота', 
      emoji: '💼',
      subcategories: [
        { id: 'vacancies', name: 'Вакансії' },
        { id: 'resumes', name: 'Резюме' },
        { id: 'recruiting', name: 'Послуги рекрутингу' },
        { id: 'freelance', name: 'Тимчасова робота/фріланс' }
      ]
    },
    { 
      id: 'services', 
      name: 'Послуги', 
      emoji: '🔧',
      subcategories: [
        { id: 'construction', name: 'Будівельні та ремонтні' },
        { id: 'household', name: 'Побутові послуги' },
        { id: 'education', name: 'Освіта та репетиторство' },
        { id: 'legal', name: 'Юридичні послуги' },
        { id: 'medical', name: 'Медичні та догляд' },
        { id: 'beauty', name: 'Красота та салони' },
        { id: 'it', name: 'IT та розробка' },
        { id: 'design', name: 'Дизайн та маркетинг' },
        { id: 'transport-services', name: 'Транспортні та кур\'єрські' }
      ]
    },
    { 
      id: 'electronics', 
      name: 'Електроніка', 
      emoji: '📱',
      subcategories: [
        { id: 'smartphones', name: 'Смартфони та мобільні пристрої' },
        { id: 'computers', name: 'Комп\'ютери, ноутбуки, планшети' },
        { id: 'tv-audio', name: 'ТВ, аудіо та фотоапаратура' },
        { id: 'appliances', name: 'Побутова техніка' },
        { id: 'gaming', name: 'Ігрові приставки та аксесуари' },
        { id: 'components', name: 'Запчастини та комплектуючі' }
      ]
    },
    { 
      id: 'home-garden', 
      name: 'Дім та сад', 
      emoji: '🏡',
      subcategories: [
        { id: 'furniture', name: 'Меблі для дому' },
        { id: 'kitchen', name: 'Кухонні меблі та техніка' },
        { id: 'interior', name: 'Інтер\'єр та декор' },
        { id: 'garden', name: 'Сад і город' },
        { id: 'materials', name: 'Ремонтні матеріали' },
        { id: 'lighting', name: 'Освітлення' }
      ]
    },
    { 
      id: 'fashion', 
      name: 'Мода та краса', 
      emoji: '👗',
      subcategories: [
        { id: 'clothing', name: 'Одяг' },
        { id: 'shoes', name: 'Взуття' },
        { id: 'accessories', name: 'Аксесуари' },
        { id: 'cosmetics', name: 'Косметика та парфумерія' },
        { id: 'jewelry', name: 'Ювелірні вироби' }
      ]
    },
    { 
      id: 'children', 
      name: 'Дитячі товари', 
      emoji: '🧸',
      subcategories: [
        { id: 'toys', name: 'Дитячі іграшки' },
        { id: 'kids-clothing', name: 'Одяг для дітей' },
        { id: 'strollers', name: 'Коляски та автокрісла' },
        { id: 'kids-furniture', name: 'Меблі для дітей' },
        { id: 'educational', name: 'Навчальні матеріали та книги' }
      ]
    },
    { 
      id: 'sports', 
      name: 'Спорт та хобі', 
      emoji: '⚽',
      subcategories: [
        { id: 'sports-equipment', name: 'Спортивний інвентар' },
        { id: 'bicycles', name: 'Велосипеди' },
        { id: 'music', name: 'Музичні інструменти' },
        { id: 'collecting', name: 'Колекціонування' },
        { id: 'tourism', name: 'Туризм та кемпінг' }
      ]
    },
    { 
      id: 'animals', 
      name: 'Тварини', 
      emoji: '🐕',
      subcategories: [
        { id: 'pets', name: 'Домашні тварини' },
        { id: 'adoption', name: 'Приймальники/передача безкоштовно' },
        { id: 'pet-supplies', name: 'Клітки, акваріуми, аксесуари' },
        { id: 'pet-food', name: 'Корм та засоби догляду' }
      ]
    },
    { 
      id: 'business', 
      name: 'Бізнес', 
      emoji: '💰',
      subcategories: [
        { id: 'ready-business', name: 'Готовий бізнес під продаж' },
        { id: 'commercial-equipment', name: 'Комерційне обладнання' },
        { id: 'office-equipment', name: 'Офісне обладнання' },
        { id: 'tools', name: 'Інструменти' }
      ]
    },
    { 
      id: 'tickets', 
      name: 'Квитки та заходи', 
      emoji: '🎫',
      subcategories: [
        { id: 'concerts', name: 'Концерти' },
        { id: 'sports-events', name: 'Спорт' },
        { id: 'theater', name: 'Театр' },
        { id: 'exhibitions', name: 'Виставки' }
      ]
    },
    { 
      id: 'travel', 
      name: 'Подорожі', 
      emoji: '✈️',
      subcategories: [
        { id: 'vacation-rental', name: 'Оренда квартир подобово' },
        { id: 'villas', name: 'Вілли та будинки для відпочинку' },
        { id: 'tours', name: 'Тури та поїздки' }
      ]
    },
    { 
      id: 'exchange', 
      name: 'Обмін/Віддам', 
      emoji: '🔄',
      subcategories: [
        { id: 'free', name: 'Віддам безкоштовно' },
        { id: 'exchange', name: 'Обміняю' },
        { id: 'lost-found', name: 'Знайдено/Загублено' }
      ]
    },
    { 
      id: 'wanted', 
      name: 'Куплю', 
      emoji: '🛒',
      subcategories: [
        { id: 'buy-electronics', name: 'Куплю техніку' },
        { id: 'buy-auto', name: 'Куплю авто' },
        { id: 'buy-realestate', name: 'Куплю нерухомість' },
        { id: 'buy-equipment', name: 'Куплю інструменти/обладнання' }
      ]
    },
    { 
      id: 'community', 
      name: 'Спільнота', 
      emoji: '👥',
      subcategories: [
        { id: 'local-events', name: 'Події місцеві' },
        { id: 'volunteering', name: 'Волонтерство' },
        { id: 'courses', name: 'Навчання/курси' },
        { id: 'other', name: 'Різне' }
      ]
    }
  ];



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
    <div className="discover-places">
      <div className="discover-container">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="categories-section">
          <div className="categories-scroll">
            {categories.map(category => (
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
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
          
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
                    {subcategory.name}
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
                {categories.map(category => (
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