import React from 'react';
import Button from './Button';
import CustomSelect from './CustomSelect';
import CountrySelect from './CountrySelect';
import './FilterPanel.css';

const FilterPanel = ({ 
  filters,
  onFilterChange,
  onTagToggle,
  onClearFilters,
  activeFiltersCount = 0,
  className = '',
  ...props 
}) => {
  const categories = [
    { value: '', label: 'Всі категорії' },
    { value: 'cafe', label: '☕ Кафе' },
    { value: 'restaurant', label: '🍽️ Ресторан' },
    { value: 'park', label: '🌳 Парк' },
    { value: 'museum', label: '🏛️ Музей' }
  ];

  const ratings = [
    { value: 0, label: 'Будь-який рейтинг' },
    { value: 4, label: '4+ зірки' },
    { value: 3, label: '3+ зірки' },
    { value: 2, label: '2+ зірки' }
  ];

  const distances = [
    { value: '', label: 'Будь-яка відстань' },
    { value: '1', label: 'До 1 км' },
    { value: '5', label: 'До 5 км' },
    { value: '10', label: 'До 10 км' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Найновіші' },
    { value: 'rating', label: 'За рейтингом' },
    { value: 'distance', label: 'За відстанню' },
    { value: 'popular', label: 'Популярні' }
  ];

  const availableTags = ['Wi-Fi', 'Паркінг', 'Веган-френдлі', 'Романтика', 'Kids Friendly'];

  return (
    <div className={`filter-panel ${className}`} {...props}>
      <div className="filter-panel__row">
        <CountrySelect
          value={filters.country || ''}
          onChange={(value) => onFilterChange('country', value)}
          placeholder="Всі країни"
          className="filter-panel__select"
        />

        <CustomSelect
          value={filters.category}
          onChange={(value) => onFilterChange('category', value)}
          options={categories}
          className="filter-panel__select"
        />

        <CustomSelect
          value={filters.rating}
          onChange={(value) => onFilterChange('rating', parseFloat(value))}
          options={ratings}
          className="filter-panel__select"
        />

        <CustomSelect
          value={filters.distance}
          onChange={(value) => onFilterChange('distance', value)}
          options={distances}
          className="filter-panel__select"
        />

        <CustomSelect
          value={filters.sortBy}
          onChange={(value) => onFilterChange('sortBy', value)}
          options={sortOptions}
          className="filter-panel__select"
        />

        {activeFiltersCount > 0 && (
          <Button 
            variant="outline" 
            size="medium"
            onClick={onClearFilters}
            className="filter-panel__clear"
          >
            Очистити ({activeFiltersCount})
          </Button>
        )}
      </div>

      <div className="filter-panel__tags">
        {availableTags.map(tag => (
          <Button
            key={tag}
            variant={filters.tags?.includes(tag) ? 'primary' : 'secondary'}
            size="small"
            onClick={() => onTagToggle(tag)}
            className="filter-panel__tag"
          >
            {tag}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FilterPanel;