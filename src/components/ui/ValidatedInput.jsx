import React, { memo } from 'react';
import { classNames } from '../../utils/classNames';
import { useRealTimeValidation } from '../../hooks/useRealTimeValidation';
import './ValidatedInput.css';

const ValidatedInput = memo(({  
  name, 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  className = '',
  rows,
  ...props 
 }) => {
  const { errors, isValid, hasErrors } = useRealTimeValidation(name, value);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className="validated-input-wrapper">
      <InputComponent
        type={type === 'textarea' ? undefined : type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={`validated-input ${className} ${
          value && hasErrors ? 'error' : 
          value && isValid ? 'valid' : ''
        }`}
        {...props}
      />
      {hasErrors && (
        <div className="validation-errors">
          {errors.map((error, index) => (
            <span key={index} className="error-message">
              ❌ {error}
            </span>
          ))}
        </div>
      )}
      {value && isValid && !hasErrors && (
        <span className="success-indicator">✅</span>
      )}
    </div>
  );
});

ValidatedInput.displayName = 'ValidatedInput';

export default ValidatedInput;