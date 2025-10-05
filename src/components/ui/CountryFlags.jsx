import React from 'react';
import { useCountries } from '../../hooks/useCountries';
import './CountryFlags.css';

const CountryFlags = ({ onCountryClick, isVisible }) => {
  const { countries, loading, error } = useCountries();

  if (loading) return <div className="country-flags loading">Loading countries...</div>;
  if (error) return <div className="country-flags error">Error loading countries</div>;

  return (
    <div className={`country-flags ${isVisible ? 'visible' : ''}`}>
      <div className="flags-container">
        {countries.map((country) => (
          <div
            key={country.id}
            className="flag-item"
            onClick={() => {
              console.log('Flag clicked:', country.name);
              onCountryClick([50.4501, 30.5234]); // Default coordinates for now
            }}
            data-tooltip={country.name}
          >
            <span className="flag-emoji">{country.flag}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountryFlags;