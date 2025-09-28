import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../components/ui/StarRating';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
import CustomSelect from '../components/ui/CustomSelect';
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
    tags: [],
    // Нерухомість
    operationType: '', // продаж/оренда
    // Авто
    brand: '',
    model: '',
    year: '',
    price: ''
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
        category: ['real-estate', 'auto', 'jobs', 'cafe', 'restaurant', 'park', 'museum'][i % 7],
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
      tags: [],
      operationType: '',
      brand: '',
      model: '',
      year: '',
      price: ''
    });
    setSearchQuery('');
  };

  // Дані для фільтрів авто
  const carBrands = [
    { value: '', label: 'Всі марки' },
    { value: 'toyota', label: 'Toyota' },
    { value: 'volkswagen', label: 'Volkswagen' },
    { value: 'bmw', label: 'BMW' },
    { value: 'mercedes', label: 'Mercedes-Benz' },
    { value: 'audi', label: 'Audi' },
    { value: 'honda', label: 'Honda' },
    { value: 'ford', label: 'Ford' }
  ];

  const carModels = {
    toyota: [{ value: '', label: 'Всі моделі' }, { value: 'camry', label: 'Camry' }, { value: 'corolla', label: 'Corolla' }],
    volkswagen: [{ value: '', label: 'Всі моделі' }, { value: 'golf', label: 'Golf' }, { value: 'passat', label: 'Passat' }],
    bmw: [{ value: '', label: 'Всі моделі' }, { value: 'x5', label: 'X5' }, { value: '3series', label: '3 Series' }],
    '': [{ value: '', label: 'Всі моделі' }]
  };

  const carYears = Array.from({ length: 25 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });
  carYears.unshift({ value: '', label: 'Всі роки' });

  const getCategoryIcon = (category) => {
    const icons = {
      'real-estate': '🏠',
      'auto': '🚗',
      'jobs': '👔',
      cafe: '☕',
      restaurant: '🍽️',
      park: '🌳',
      museum: '🏛️'
    };
    return icons[category] || '📍';
  };

  const getCategoryName = (category) => {
    const names = {
      'real-estate': 'Нерухомість',
      'auto': 'Авто',
      'jobs': 'Вакансії',
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


      {/* Результати */}
      <div className="results-info">
        <span className="results-count">
          Знайдено {filteredAds.length} оголошень
        </span>
      </div>

      {/* Контейнер з фільтрами та сіткою */}
      <div className="ads-content-container">
        {/* Бічна панель фільтрів */}
        <div className="sidebar-filters">
          <Link to="/create-ad" className="create-ad-btn">
            ➕ Створити оголошення
          </Link>
          
          <h3>Фільтри</h3>
          
          <div className="filter-group">
            <label>Країна</label>
            <CustomSelect
              value={filters.country}
              onChange={(value) => handleFilterChange('country', value)}
              placeholder="Всі країни"
              options={[
                { value: '', label: 'Всі країни' },
                { value: 'ukraine', label: '🇺🇦 Україна' },
                { value: 'poland', label: '🇵🇱 Польща' },
                { value: 'germany', label: '🇩🇪 Німеччина' },
                { value: 'france', label: '🇫🇷 Франція' }
              ]}
            />
          </div>

          <div className="filter-group">
            <label>Область/Місто</label>
            <CustomSelect
              value={filters.region}
              onChange={(value) => handleFilterChange('region', value)}
              placeholder="Всі області/міста"
              options={[
                { value: '', label: 'Всі області/міста' },
                { value: 'kyiv', label: 'Київ' },
                { value: 'lviv', label: 'Львів' },
                { value: 'odesa', label: 'Одеса' },
                { value: 'kharkiv', label: 'Харків' }
              ]}
            />
          </div>

          <div className="filter-group">
            <label>Категорія</label>
            <CustomSelect
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
              placeholder="Всі категорії"
              options={[
                { value: '', label: 'Всі категорії' },
                { value: 'real-estate', label: '🏠 Нерухомість' },
                { value: 'auto', label: '🚗 Авто' },
                { value: 'jobs', label: '👔 Вакансії' },
                { value: 'cafe', label: '☕ Кафе' },
                { value: 'restaurant', label: '🍽️ Ресторан' },
                { value: 'park', label: '🌳 Парк' },
                { value: 'museum', label: '🏛️ Музей' }
              ]}
            />
          </div>

          <div className="filter-group">
            <label>Сортування</label>
            <CustomSelect
              value={filters.sortBy}
              onChange={(value) => handleFilterChange('sortBy', value)}
              placeholder="Сортування"
              options={[
                { value: 'distance', label: 'За відстанню' },
                { value: 'popular', label: 'Популярні' }
              ]}
            />
          </div>

          {/* Додаткові фільтри для нерухомості */}
          {filters.category === 'real-estate' && (
            <div className="filter-group">
              <label>Тип операції</label>
              <CustomSelect
                value={filters.operationType}
                onChange={(value) => handleFilterChange('operationType', value)}
                placeholder="Оберіть тип"
                options={[
                  { value: '', label: 'Всі типи' },
                  { value: 'sale', label: 'Продаж' },
                  { value: 'rent', label: 'Оренда' }
                ]}
              />
            </div>
          )}

          {/* Додаткові фільтри для авто */}
          {filters.category === 'auto' && (
            <>
              <div className="filter-group">
                <label>Марка</label>
                <CustomSelect
                  value={filters.brand}
                  onChange={(value) => {
                    handleFilterChange('brand', value);
                    handleFilterChange('model', ''); // Скидаємо модель при зміні марки
                  }}
                  placeholder="Оберіть марку"
                  options={carBrands}
                />
              </div>

              {filters.brand && (
                <div className="filter-group">
                  <label>Модель</label>
                  <CustomSelect
                    value={filters.model}
                    onChange={(value) => handleFilterChange('model', value)}
                    placeholder="Оберіть модель"
                    options={carModels[filters.brand] || carModels['']}
                  />
                </div>
              )}

              <div className="filter-group">
                <label>Рік випуску</label>
                <CustomSelect
                  value={filters.year}
                  onChange={(value) => handleFilterChange('year', value)}
                  placeholder="Оберіть рік"
                  options={carYears}
                />
              </div>

              <div className="filter-group">
                <label>Ціна</label>
                <CustomSelect
                  value={filters.price}
                  onChange={(value) => handleFilterChange('price', value)}
                  placeholder="Оберіть ціну"
                  options={[
                    { value: '', label: 'Будь-яка ціна' },
                    { value: '0-5000', label: 'До $5,000' },
                    { value: '5000-10000', label: '$5,000 - $10,000' },
                    { value: '10000-20000', label: '$10,000 - $20,000' },
                    { value: '20000-50000', label: '$20,000 - $50,000' },
                    { value: '50000+', label: 'Від $50,000' }
                  ]}
                />
              </div>
            </>
          )}

          {activeFiltersCount > 0 && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              Очистити фільтри ({activeFiltersCount})
            </button>
          )}
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
      </div>

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