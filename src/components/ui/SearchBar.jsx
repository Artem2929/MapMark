import React from 'react';
import './SearchBar.css';

const SearchBar = ({ 
  value, 
  onChange, 
  onSearch,
  placeholder = 'Пошук...',
  buttonText = 'Пошук',
  className = '',
  ...props 
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  const handleSearch = () => {
    if (value && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={`search-bar ${className}`} {...props}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="search-bar__input"
      />
      <button 
        onClick={handleSearch}
        className="search-bar__button"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default SearchBar;