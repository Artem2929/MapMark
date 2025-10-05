import React from 'react';
import { useCountries } from '../../hooks/useCountries';
import CustomSelect from './CustomSelect';

const CountrySelect = ({ value, onChange, placeholder = "Select country", className = '' }) => {
  const { countries, loading, error } = useCountries();

  if (loading) {
    return (
      <CustomSelect
        value=""
        onChange={() => {}}
        options={[{ value: '', label: 'Loading countries...' }]}
        placeholder={placeholder}
        className={className}
      />
    );
  }

  if (error) {
    return (
      <CustomSelect
        value=""
        onChange={() => {}}
        options={[{ value: '', label: 'Error loading countries' }]}
        placeholder={placeholder}
        className={className}
      />
    );
  }

  const options = [
    { value: '', label: placeholder },
    ...countries.map(country => ({
      value: country.id,
      label: `${country.flag} ${country.name}`
    }))
  ];

  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default CountrySelect;