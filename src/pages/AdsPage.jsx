import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CreateAdForm from '../components/forms/CreateAdForm';
import Footer from '../components/layout/Footer.jsx';
import CustomSelect from '../components/ui/CustomSelect';
import './AdsPage.css';

const AdsPage = () => {
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [filters, setFilters] = useState({
    country: '',
    location: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    rating: 0,
    hasPhotos: false,
    hasVideo: false
  });

  const categories = [
    { id: 'housing', icon: '🏠', name: 'Housing Rental' },
    { id: 'cars', icon: '🚗', name: 'Car Rental' },
    { id: 'restaurants', icon: '🍽️', name: 'Restaurants' },
    { id: 'hotels', icon: '🏨', name: 'Hotels' },
    { id: 'events', icon: '🎟️', name: 'Events' },
    { id: 'tourism', icon: '🏖️', name: 'Tourism' },
    { id: 'services', icon: '📦', name: 'Services' },
    { id: 'other', icon: '📍', name: 'Other' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      country: '',
      location: '',
      category: '',
      dateFrom: '',
      dateTo: '',
      rating: 0,
      hasPhotos: false,
      hasVideo: false
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== 0 && value !== false
  ).length;

  const countries = [
    { code: 'UA', name_en: 'Ukraine' },
    { code: 'US', name_en: 'United States' },
    { code: 'GB', name_en: 'United Kingdom' },
    { code: 'DE', name_en: 'Germany' },
    { code: 'FR', name_en: 'France' },
    { code: 'IT', name_en: 'Italy' },
    { code: 'ES', name_en: 'Spain' },
    { code: 'PL', name_en: 'Poland' },
    { code: 'CA', name_en: 'Canada' },
    { code: 'AU', name_en: 'Australia' }
  ];

  return (
    <div className="ads-page">
      <div className="ads-header">
        <h1>🌟 {t('ads.title')}</h1>
        <p>{t('ads.description')}</p>
        <button 
          className="create-ad-btn"
          onClick={() => setShowCreateForm(true)}
        >
          + {t('ads.createAd')}
        </button>
      </div>

      <div className="ads-content">
        <div className="filters-sidebar">
          <div className="filters-header">
            <h3>Фільтр</h3>
            <button className="reset-filters" onClick={resetFilters}>
              Reset all
            </button>
          </div>

          {/* Country Filter */}
          <div className="filter-group">
            <label>Country</label>
            <CustomSelect
              options={countries}
              value={filters.country}
              onChange={(value) => handleFilterChange('country', value)}
              placeholder="Select country"
            />
          </div>

          {/* Location Filter */}
          <div className="filter-group">
            <label>Location</label>
            <input
              type="text"
              placeholder="Enter location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <label>Category</label>
            <CustomSelect
              options={categories.map(cat => ({ code: cat.id, name_en: cat.name }))}
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
              placeholder="Select category"
            />
          </div>

          {/* Date Range Filter */}
          <div className="filter-group">
            <label>Date Range</label>
            <div className="date-inputs">
              <input
                type="date"
                placeholder="From"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
              <span>to</span>
              <input
                type="date"
                placeholder="To"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="filter-group">
            <label>Rating</label>
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className={`star-btn ${filters.rating >= star ? 'active' : ''}`}
                  onClick={() => handleFilterChange('rating', star)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Media Filter */}
          <div className="filter-group">
            <label>Media</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.hasPhotos}
                  onChange={(e) => handleFilterChange('hasPhotos', e.target.checked)}
                />
                Has Photos
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.hasVideo}
                  onChange={(e) => handleFilterChange('hasVideo', e.target.checked)}
                />
                Has Video
              </label>
            </div>
          </div>
        </div>

        <div className="ads-results">
          <div className="results-header">
            <h3>Results</h3>
            <div className="sort-options">
              <select>
                <option>Sort by Relevance</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating</option>
                <option>Date Added</option>
              </select>
            </div>
          </div>

          <div className="ads-grid">
            {/* Sample ads - replace with real data */}
            {[1,  6].map(id => (
              <div key={id} className="ad-card">
                <div className="ad-image">
                  <div className="placeholder-image">📷</div>
                  <div className="ad-badge">Featured</div>
                </div>
                <div className="ad-content">
                  <h4>Sample Advertisement {id}</h4>
                  <p className="ad-location">📍 Kyiv, Ukraine</p>
                  <p className="ad-description">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                  </p>
                  <div className="ad-rating">
                    ⭐⭐⭐⭐⭐ <span>(4.8)</span>
                  </div>
                  <div className="ad-price">
                    <span className="price">$50</span>
                    <span className="period">/day</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {showCreateForm && (
        <CreateAdForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={(adData) => {
            console.log('New ad created:', adData);
            setShowCreateForm(false);
          }}
        />
      )}
      <Footer />
    </div>
  );
};

export default AdsPage;