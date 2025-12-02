import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { classNames } from '../../utils/classNames';
import '../../styles/hashtag-input.css';

const HashtagInput = memo(({ 
  value = [],
  onChange,
  placeholder = "Додати хештеги... #travel #ukraine",
  maxTags = 10,
  suggestions = [],
  disabled = false,
  className = ""
 }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef(null);

  // Ensure value is always an array
  const tags = Array.isArray(value) ? value : [];

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion)
  );

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(newValue.length > 0 && filteredSuggestions.length > 0);
    setActiveSuggestion(-1);
  };

  const addHashtag = (tag) => {
    const cleanTag = tag.startsWith('#') ? tag.trim() : `#${tag.trim()}`;
    if (cleanTag && !tags.includes(cleanTag) && tags.length < maxTags) {
      onChange([...tags, cleanTag]);
      setInputValue('');
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  const removeHashtag = (index) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestion >= 0 && filteredSuggestions[activeSuggestion]) {
        addHashtag(filteredSuggestions[activeSuggestion]);
      } else if (inputValue.trim()) {
        addHashtag(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeHashtag(tags.length - 1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    addHashtag(suggestion);
  };

  const getCounterClass = () => {
    if (tags.length >= maxTags) return 'hashtag-counter--limit';
    if (tags.length >= maxTags * 0.8) return 'hashtag-counter--warning';
    return '';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`hashtag-input-container ${className}`} ref={inputRef}>
      <input
        type="text"
        className="hashtag-input"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoComplete="off"
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="hashtag-suggestions">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`hashtag-suggestion ${
                index === activeSuggestion ? 'hashtag-suggestion--active' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className="hashtag-suggestion__text">#{suggestion}</span>
            </div>
          ))}
        </div>
      )}

      <div className="hashtag-preview">
        {tags.map((tag, index) => (
          <span key={`${tag}-${index}`} className="hashtag-tag hashtag-tag--new">
            {tag}
            <button
              type="button"
              className="hashtag-remove"
              onClick={() => removeHashtag(index)}
              disabled={disabled}
              aria-label={`Видалити хештег ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {tags.length > 0 && (
        <div className={`hashtag-counter ${getCounterClass()}`}>
          <span className="hashtag-counter__count">
            {tags.length}/{maxTags} хештегів
          </span>
        </div>
      )}
    </div>
  );
});

HashtagInput.displayName = 'HashtagInput';

export default HashtagInput;