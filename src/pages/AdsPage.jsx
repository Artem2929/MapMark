import React, { useState, useEffect } from 'react';
import { classNames } from '../utils/classNames';
import { useOptimizedState } from '../hooks/useOptimizedState';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import StarRating from '../components/ui/StarRating';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import CustomSelect from '../components/ui/CustomSelect';
import CreateAdForm from '../components/forms/CreateAdForm';
import AdsService from '../services/adsService';
import { categoriesService } from '../services/categoriesService.js';
import { filtersService } from '../services/filtersService.js';
import './AdsPage.css';
import './DiscoverPlaces.css';

const AdsPage = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [ads, setAds] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({ countries: [], regions: [] });

  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showCreateAdForm, setShowCreateAdForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [showSubcategories, setShowSubcategories] = useState(false);
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

  const loadFilters = async () => {
    try {
      const data = await filtersService.getFilters();
      setFilterOptions(data);
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  };

  useEffect(() => {
    loadCategories();
    loadFilters();
    
    const handleLanguageChange = () => {
      loadCategories();
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  useEffect(() => {
    if (!categoriesLoading && selectedCategory && ads.length === 0) {
      loadAds();
    }
  }, [categoriesLoading]);

  useEffect(() => {
    if (searchQuery || Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v && v !== 'rating')) {
      const timeoutId = setTimeout(() => {
        loadAds();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, filters, currentPage]);



  const loadAds = async () => {
    if (!selectedCategory) return;
    
    // Показуємо loading тільки при першому завантаженні
    if (ads.length === 0 && !categoriesLoading) {
      setLoading(true);
    }
    
    try {
      const params = {
        category: selectedCategory,
        subcategory: selectedSubcategory,
        search: searchQuery,
        sortBy: filters.sortBy,
        country: filters.country,
        region: filters.region,
        page: currentPage,
        limit: itemsPerPage
      };
      
      const response = await AdsService.getAds(params);
      setAds(response.data || []);
      setFilteredAds(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error('Помилка завантаження оголошень:', error);
      setAds([]);
      setFilteredAds([]);
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

  if (loading && ads.length === 0 && categoriesLoading) {
    return (
      <div className="ads-page">
        <div className="loading-state">
          <div className="spinner">🔄</div>
          <p>Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container ads-page">
      <Breadcrumbs />
      
        <div className="categories-section">
          {categoriesLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Завантаження категорій...</p>
            </div>
          ) : (
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
                      setCurrentPage(1);
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
          <button 
            className="create-ad-btn"
            onClick={() => setShowCreateAdForm(true)}
          >
            ➕ Створити оголошення
          </button>
          
          <h3>Фільтри</h3>
          
          <div className="filter-group">
            <label>Країна</label>
            <CustomSelect
              value={filters.country}
              onChange={(value) => handleFilterChange('country', value)}
              placeholder="Всі країни"
              options={filterOptions.countries}
            />
          </div>

          <div className="filter-group">
            <label>Область/Місто</label>
            <CustomSelect
              value={filters.region}
              onChange={(value) => handleFilterChange('region', value)}
              placeholder="Всі області"
              options={filterOptions.regions}
            />
          </div>

          <div className="filter-group">
            <label>Тип угоди</label>
            <CustomSelect
              value={filters.dealType}
              onChange={(value) => handleFilterChange('dealType', value)}
              placeholder="Всі типи"
              options={[
                { value: '', label: 'Всі типи' },
                { value: 'sale', label: 'Продаж' },
                { value: 'rent', label: 'Оренда' }
              ]}
            />
          </div>

          <div className="filter-group">
            <label>Тип нерухомості</label>
            <CustomSelect
              value={filters.propertyType}
              onChange={(value) => handleFilterChange('propertyType', value)}
              placeholder="Всі типи"
              options={[
                { value: '', label: 'Всі типи' },
                { value: 'apartment', label: 'Квартира' },
                { value: 'house', label: 'Будинок' },
                { value: 'office', label: 'Офіс / Комерційна нерухомість' },
                { value: 'land', label: 'Ділянка / Земля' },
                { value: 'garage', label: 'Гараж / Паркомісце' },
                { value: 'other', label: 'Інше' }
              ]}
            />
          </div>

          <div className="filter-group">
            <label>Загальна (м²)</label>
            <input
              type="number"
              placeholder="Площа м²"
              value={filters.totalArea || ''}
              onChange={(e) => handleFilterChange('totalArea', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Житлова (м²)</label>
            <input
              type="number"
              placeholder="Площа м²"
              value={filters.livingArea || ''}
              onChange={(e) => handleFilterChange('livingArea', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Кухня (м²)</label>
            <input
              type="number"
              placeholder="Площа м²"
              value={filters.kitchenArea || ''}
              onChange={(e) => handleFilterChange('kitchenArea', e.target.value)}
              className="filter-input"
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

        {/* Список оголошень або порожній стан */}
        <div className="ads-main-content">
          {loading && ads.length === 0 ? (
            <div className="loading-state">
              <div className="spinner">🔄</div>
              <p>Завантаження оголошень...</p>
            </div>
          ) : (
            <div className="category-placeholder">
              <div className="placeholder-icon">{categories.find(cat => cat.id === selectedCategory)?.emoji || '📍'}</div>
              <h3>Категорія: {categories.find(cat => cat.id === selectedCategory)?.name}</h3>
              <p>Оголошення для цієї категорії будуть відображені тут</p>
              {selectedSubcategory && (
                <p>Підкатегорія: {categories.find(cat => cat.id === selectedCategory)?.subcategories?.find(sub => sub.id === selectedSubcategory)?.name}</p>
              )}
            </div>
          )}
        </div>
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


      
      {showCreateAdForm && (
        <CreateAdForm onClose={() => setShowCreateAdForm(false)} />
      )}
    </div>
  );
};

export default AdsPage;