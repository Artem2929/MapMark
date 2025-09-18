import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../components/ui/StarRating';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import './AdsPage.css';

const AdsPage = () => {
  const [ads, setAds] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    rating: 0,
    distance: '',
    sortBy: 'newest',
    tags: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadAds();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [ads, searchQuery, filters]);

  const loadAds = async () => {
    setLoading(true);
    try {
      // Mock data - замінити на API виклик
      const mockAds = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        title: `Місце ${i + 1}`,
        description: `Опис місця ${i + 1}`,
        category: ['cafe', 'restaurant', 'park', 'museum'][i % 4],
        rating: 3 + Math.random() * 2,
        distance: Math.floor(Math.random() * 10) + 1,
        image: `/images/place${(i % 5) + 1}.jpg`,
        tags: ['Wi-Fi', 'Паркінг', 'Веган-френдлі'].slice(0, Math.floor(Math.random() * 3) + 1),
        price: Math.floor(Math.random() * 4) + 1,
        isNew: i < 5,
        isPopular: Math.random() > 0.7,
        hasPromo: Math.random() > 0.8,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      }));
      
      setAds(mockAds);
    } catch (error) {
      console.error('Помилка завантаження оголошень:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...ads];

    // Пошук
    if (searchQuery) {
      filtered = filtered.filter(ad => 
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фільтр по категорії
    if (filters.category) {
      filtered = filtered.filter(ad => ad.category === filters.category);
    }

    // Фільтр по рейтингу
    if (filters.rating > 0) {
      filtered = filtered.filter(ad => ad.rating >= filters.rating);
    }

    // Фільтр по відстані
    if (filters.distance) {
      const maxDistance = parseInt(filters.distance);
      filtered = filtered.filter(ad => ad.distance <= maxDistance);
    }

    // Фільтр по тегах
    if (filters.tags.length > 0) {
      filtered = filtered.filter(ad => 
        filters.tags.some(tag => ad.tags.includes(tag))
      );
    }

    // Сортування
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        filtered.sort((a, b) => a.distance - b.distance);
        break;
      case 'popular':
        filtered.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
    }

    setFilteredAds(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTagToggle = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      rating: 0,
      distance: '',
      sortBy: 'newest',
      tags: []
    });
    setSearchQuery('');
  };

  const getCategoryIcon = (category) => {
    const icons = {
      cafe: '☕',
      restaurant: '🍽️',
      park: '🌳',
      museum: '🏛️'
    };
    return icons[category] || '📍';
  };

  const getCategoryName = (category) => {
    const names = {
      cafe: 'Кафе',
      restaurant: 'Ресторан',
      park: 'Парк',
      museum: 'Музей'
    };
    return names[category] || category;
  };

  const paginatedAds = filteredAds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeFiltersCount = Object.values(filters).filter(v => 
    Array.isArray(v) ? v.length > 0 : v && v !== 'newest'
  ).length + (searchQuery ? 1 : 0);

  if (loading) {
    return (
      <div className="ads-page">
        <div className="loading-state">
          <div className="spinner">🔄</div>
          <p>Завантаження оголошень...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ads-page">
      <Breadcrumbs />
      {/* Заголовок та пошук */}
      <div className="page-header">
        <div className="header-content">
          <h1>Оголошення</h1>
          <div className="header-actions">
            <Link to="/create-ad" className="create-ad-btn">
              ➕ Створити оголошення
            </Link>
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                ⊞ Список
              </button>
              <button 
                className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                🗺️ Карта
              </button>
            </div>
          </div>
        </div>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Пошук оголошень..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="ads-search-btn">🔍</button>
        </div>
      </div>

      {/* Фільтри */}
      <div className="filters-panel">
        <div className="filters-row">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">Всі категорії</option>
            <option value="cafe">☕ Кафе</option>
            <option value="restaurant">🍽️ Ресторан</option>
            <option value="park">🌳 Парк</option>
            <option value="museum">🏛️ Музей</option>
          </select>

          <select
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
            className="filter-select"
          >
            <option value={0}>Будь-який рейтинг</option>
            <option value={4}>4+ зірки</option>
            <option value={3}>3+ зірки</option>
            <option value={2}>2+ зірки</option>
          </select>

          <select
            value={filters.distance}
            onChange={(e) => handleFilterChange('distance', e.target.value)}
            className="filter-select"
          >
            <option value="">Будь-яка відстань</option>
            <option value="1">До 1 км</option>
            <option value="5">До 5 км</option>
            <option value="10">До 10 км</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="filter-select"
          >
            <option value="newest">Найновіші</option>
            <option value="rating">За рейтингом</option>
            <option value="distance">За відстанню</option>
            <option value="popular">Популярні</option>
          </select>

          {activeFiltersCount > 0 && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              Очистити ({activeFiltersCount})
            </button>
          )}
        </div>

        <div className="tags-filter">
          {['Wi-Fi', 'Паркінг', 'Веган-френдлі', 'Романтика', 'Kids Friendly'].map(tag => (
            <button
              key={tag}
              className={`tag-filter ${filters.tags.includes(tag) ? 'active' : ''}`}
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Результати */}
      <div className="results-info">
        <span className="results-count">
          Знайдено {filteredAds.length} оголошень
        </span>
      </div>

      {/* Список оголошень */}
      {viewMode === 'grid' && (
        <div className="ads-grid">
          {paginatedAds.map(ad => (
            <Link key={ad.id} to={`/ads/${ad.id}`} className="ad-card">
              <div className="ad-image">
                <img src={ad.image} alt={ad.title} />
                <div className="ad-badges">
                  {ad.isNew && <span className="badge new">Нове</span>}
                  {ad.isPopular && <span className="badge popular">Популярне</span>}
                  {ad.hasPromo && <span className="badge promo">Акція</span>}
                </div>
                <div className="ad-distance">{ad.distance} км</div>
              </div>
              
              <div className="ad-content">
                <div className="ad-category">
                  {getCategoryIcon(ad.category)} {getCategoryName(ad.category)}
                </div>
                
                <h3 className="ad-title">{ad.title}</h3>
                <p className="ad-description">{ad.description}</p>
                
                <div className="ad-rating">
                  <StarRating rating={ad.rating} size="small" />
                  <span className="rating-text">{ad.rating.toFixed(1)}</span>
                </div>
                
                <div className="ad-tags">
                  {ad.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="ad-tag">{tag}</span>
                  ))}
                  {ad.tags.length > 2 && (
                    <span className="more-tags">+{ad.tags.length - 2}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Пагінація */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            ← Попередня
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`page-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button 
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Наступна →
          </button>
        </div>
      )}

      {/* Порожній стан */}
      {filteredAds.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Оголошення не знайдено</h3>
          <p>Спробуйте змінити фільтри або пошуковий запит</p>
          <button className="clear-filters-btn" onClick={clearFilters}>
            Очистити фільтри
          </button>
        </div>
      )}
    </div>
  );
};

export default AdsPage;