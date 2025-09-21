import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../components/ui/StarRating';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
import './AdsPage.css';

const AdsPage = () => {
  const [ads, setAds] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    country: '',
    region: '',
    category: '',
    rating: 0,
    distance: '',
    sortBy: 'rating',
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
        image: `https://picsum.photos/300/160?random=${i + 1}`,
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
      country: '',
      region: '',
      category: '',
      rating: 0,
      distance: '',
      sortBy: 'rating',
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
    Array.isArray(v) ? v.length > 0 : v && v !== 'rating'
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
      {/* Фільтри */}
      <div className="filters-panel">
        <div className="filters-row">
          <Link to="/create-ad" className="create-ad-btn">
            ➕ Створити оголошення
          </Link>
          <select
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="filter-select"
          >
            <option value="">Всі країни</option>
            <option value="ukraine">🇺🇦 Україна</option>
            <option value="poland">🇵🇱 Польща</option>
            <option value="germany">🇩🇪 Німеччина</option>
            <option value="france">🇫🇷 Франція</option>
          </select>

          <select
            value={filters.region}
            onChange={(e) => handleFilterChange('region', e.target.value)}
            className="filter-select"
          >
            <option value="">Всі області/міста</option>
            <option value="kyiv">Київ</option>
            <option value="lviv">Львів</option>
            <option value="odesa">Одеса</option>
            <option value="kharkiv">Харків</option>
          </select>

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
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="filter-select"
          >
            <option value="rating">За рейтингом</option>
            <option value="distance">За відстанню</option>
            <option value="popular">Популярні</option>
          </select>

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
            <Link key={ad.id} to={`/ads/${ad.id}`} className="ads-ad-card">
              <div className="ads-ad-image">
                <img src={ad.image} alt={ad.title} />
                <div className="ads-ad-badges">
                  {ad.isNew && <span className="ads-badge ads-new">Нове</span>}
                  {ad.isPopular && <span className="ads-badge ads-popular">Популярне</span>}
                  {ad.hasPromo && <span className="ads-badge ads-promo">Акція</span>}
                </div>
                <div className="ads-ad-distance">{ad.distance} км</div>
              </div>
              
              <div className="ads-ad-content">
                <div className="ads-ad-category">
                  {getCategoryIcon(ad.category)} {getCategoryName(ad.category)}
                </div>
                
                <h3 className="ads-ad-title">{ad.title}</h3>
                
                <div className="ads-ad-footer">
                  <div className="ads-ad-rating">
                    <StarRating rating={ad.rating} size="small" />
                    <span className="ads-rating-text">{ad.rating.toFixed(1)}</span>
                  </div>
                  
                  <div className="ads-ad-tags">
                    {ad.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="ads-ad-tag">{tag}</span>
                    ))}
                    {ad.tags.length > 2 && (
                      <span className="ads-more-tags">+{ad.tags.length - 2}</span>
                    )}
                  </div>
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
      
      <Footer />
    </div>
  );
};

export default AdsPage;