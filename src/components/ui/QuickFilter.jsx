import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import countriesData from '../../data/countries.json';
import './QuickFilter.css';

const QuickFilter = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    country: '',
    category: ''
  });

  const countries = countriesData;

  const categories = [
    { id: 'housing', name: t('ads.categories.housing') },
    { id: 'cars', name: t('ads.categories.cars') },
    { id: 'restaurants', name: t('ads.categories.restaurants') },
    { id: 'hotels', name: t('ads.categories.hotels') },
    { id: 'events', name: t('ads.categories.events') },
    { id: 'tourism', name: t('ads.categories.tourism') },
    { id: 'services', name: t('ads.categories.services') },
    { id: 'other', name: t('ads.categories.other') }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters = { country: '', category: '' };
    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  return (
    <div className={`quick-filter ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="filter-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="filter-icon">🔍</span>
        <span className="filter-text">{t('filter.quickFilter')}</span>
        <span className={`arrow ${isExpanded ? 'up' : 'down'}`}>▼</span>
      </div>
      
      {isExpanded && (
        <div className="filter-content">
          <div className="filter-group">
            <label>{t('ads.form.country')}</label>
            <select
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
            >
              <option value="">{t('ads.form.selectCountry')}</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name_en}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>{t('ads.form.category')}</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">{t('ads.form.selectCategory')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button className="clear-btn" onClick={clearFilters}>
              {t('filter.clear')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickFilter;