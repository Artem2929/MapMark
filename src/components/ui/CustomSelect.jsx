import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

const CustomSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.code === value);

  return (
    <div className="custom-select" ref={selectRef}>
      <div 
        className={`select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.name_en : placeholder}</span>
        <span className={`select-arrow ${isOpen ? 'up' : 'down'}`}>▼</span>
      </div>
      
      {isOpen && (
        <div className="select-dropdown">
          {options.map(option => (
            <div
              key={option.code}
              className={`select-option ${value === option.code ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.code);
                setIsOpen(false);
              }}
            >
              {option.name_en}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;