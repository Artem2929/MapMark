import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { 
  Container, 
  Section, 
  Grid, 
  Button, 
  SearchBar, 
  FilterPanel, 
  AdCard, 
  Pagination
} from '../components/ui';

const AdsPage = () => {
  const [ads, setAds] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '', rating: 0, distance: '', sortBy: 'newest', tags: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const mockAds = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      title: `Місце ${i + 1}`,
      description: `Опис місця ${i + 1}`,
      category: ['cafe', 'restaurant', 'park', 'museum'][i % 4],
      rating: 3 + Math.random() * 2,
      distance: Math.floor(Math.random() * 10) + 1,
      image: `https://images.unsplash.com/photo-${1500000000000 + i}?w=400&h=300&fit=crop`,
      tags: ['Wi-Fi', 'Паркінг', 'Веган-френдлі'].slice(0, Math.floor(Math.random() * 3) + 1),
      isNew: i < 5, isPopular: Math.random() > 0.7, hasPromo: Math.random() > 0.8,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    }));
    setAds(mockAds);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = [...ads];
    if (searchQuery) filtered = filtered.filter(ad => 
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filters.category) filtered = filtered.filter(ad => ad.category === filters.category);
    if (filters.rating > 0) filtered = filtered.filter(ad => ad.rating >= filters.rating);
    if (filters.distance) filtered = filtered.filter(ad => ad.distance <= parseInt(filters.distance));
    if (filters.tags.length > 0) filtered = filtered.filter(ad => 
      filters.tags.some(tag => ad.tags.includes(tag)));
    
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'distance': return a.distance - b.distance;
        case 'popular': return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
        default: return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredAds(filtered);
    setCurrentPage(1);
  }, [ads, searchQuery, filters]);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const handleTagToggle = (tag) => setFilters(prev => ({
    ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
  }));
  const clearFilters = () => {
    setFilters({ category: '', rating: 0, distance: '', sortBy: 'newest', tags: [] });
    setSearchQuery('');
  };

  const paginatedAds = filteredAds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredAds.length / itemsPerPage);
  const activeFiltersCount = Object.values(filters).filter(v => 
    Array.isArray(v) ? v.length > 0 : v && v !== 'newest').length + (searchQuery ? 1 : 0);

  if (loading) {
    return (
      <PageLayout showBreadcrumbs={false}>
        <Container>
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔄</div>
            <p>Завантаження оголошень...</p>
          </div>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout background="gradient">
      <Container>
        <Section spacing="medium" background="glass">
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Оголошення</h1>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Link to="/create-ad">
                  <Button variant="primary" size="large">➕ Створити</Button>
                </Link>
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.04)', borderRadius: '12px', padding: '4px' }}>
                  <Button variant={viewMode === 'grid' ? 'primary' : 'secondary'} size="medium" onClick={() => setViewMode('grid')}>⊞</Button>
                  <Button variant={viewMode === 'map' ? 'primary' : 'secondary'} size="medium" onClick={() => setViewMode('map')}>🗺️</Button>
                </div>
              </div>
            </div>
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Пошук оголошень..." />
          </div>
        </Section>

        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onTagToggle={handleTagToggle}
          onClearFilters={clearFilters}
          activeFiltersCount={activeFiltersCount}
        />

        <div style={{ marginBottom: '24px', padding: '0 16px' }}>
          <span style={{ fontSize: '16px', fontWeight: '600' }}>Знайдено {filteredAds.length} оголошень</span>
        </div>

        {paginatedAds.length > 0 ? (
          <Grid columns="auto" gap="large" style={{ marginBottom: '40px' }}>
            {paginatedAds.map(ad => <AdCard key={ad.id} ad={ad} />)}
          </Grid>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.7 }}>🔍</div>
            <h3>Оголошення не знайдено</h3>
            <p style={{ marginBottom: '24px' }}>Спробуйте змінити фільтри або пошуковий запит</p>
            <Button variant="primary" onClick={clearFilters}>Очистити фільтри</Button>
          </div>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Container>
    </PageLayout>
  );
};

export default AdsPage;