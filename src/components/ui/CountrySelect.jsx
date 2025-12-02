import React, { memo } from 'react';
import { classNames } from '../../utils/classNames';
import { useCountries } from '../../hooks/useCountries';
import CustomSelect from './CustomSelect';

const CountrySelect = memo(({  value, onChange, placeholder = "Select country", className = ''  }) => {
  const { countries, loading, error } = useCountries();

CountrySelect.displayName = 'CountrySelect';

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
});

CountrySelect.displayName = 'CountrySelect';

export default CountrySelect;