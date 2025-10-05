import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Section, 
  Grid, 
  Button, 
  SearchBar, 
  FilterPanel, 
  AdCard, 
  Pagination,
  Breadcrumbs 
} from '../components/ui';
import './AdsPageOptimized.css';

const AdsPage = () => {
  const [ads, setAds] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    country: '',
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
      // TODO: Replace with actual API call
      setAds([]);
    } catch (error) {
      console.error('Помилка завантаження оголошень:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...ads];

    if (searchQuery) {
      filtered = filtered.filter(ad => 
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.country) {
      filtered = filtered.filter(ad => ad.country === filters.country);
    }

    if (filters.category) {
      filtered = filtered.filter(ad => ad.category === filters.category);
    }

    if (filters.rating > 0) {
      filtered = filtered.filter(ad => ad.rating >= filters.rating);
    }

    if (filters.distance) {
      const maxDistance = parseInt(filters.distance);
      filtered = filtered.filter(ad => ad.distance <= maxDistance);
    }

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
      country: '',
      category: '',
      rating: 0,
      distance: '',
      sortBy: 'newest',
      tags: []
    });
    setSearchQuery('');
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
        <Container>
          <div className="loading-state">
            <div className="spinner">🔄</div>
            <p>Завантаження оголошень...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="ads-page">
      <Container>
        <Breadcrumbs />
        
        {/* Header */}
        <Section spacing="medium" background="glass">
          <div className="ads-page__header">
            <div className="ads-page__header-content">
              <h1 className="ads-page__title">Оголошення</h1>
              <div className="ads-page__actions">
                <Link to="/create-ad">
                  <Button variant="primary" size="large">
                    ➕ Створити оголошення
                  </Button>
                </Link>
                <div className="ads-page__view-toggle">
                  <Button 
                    variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                    size="medium"
                    onClick={() => setViewMode('grid')}
                  >
                    ⊞ Список
                  </Button>
                  <Button 
                    variant={viewMode === 'map' ? 'primary' : 'secondary'}
                    size="medium"
                    onClick={() => setViewMode('map')}
                  >
                    🗺️ Карта
                  </Button>
                </div>
              </div>
            </div>
            
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={(query) => console.log('Search:', query)}
              placeholder="Пошук оголошень..."
              className="ads-page__search"
            />
          </div>
        </Section>

        {/* Filters */}
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onTagToggle={handleTagToggle}
          onClearFilters={clearFilters}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Results */}
        <div className="ads-page__results-info">
          <span className="ads-page__results-count">
            Знайдено {filteredAds.length} оголошень
          </span>
        </div>

        {/* Ads Grid */}
        {viewMode === 'grid' && paginatedAds.length > 0 && (
          <Grid columns="auto" gap="large" className="ads-page__grid">
            {paginatedAds.map(ad => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </Grid>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* Empty State */}
        {filteredAds.length === 0 && (
          <div className="ads-page__empty">
            <div className="ads-page__empty-icon">🔍</div>
            <h3>Оголошення не знайдено</h3>
            <p>Спробуйте змінити фільтри або пошуковий запит</p>
            <Button variant="primary" onClick={clearFilters}>
              Очистити фільтри
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default AdsPage;