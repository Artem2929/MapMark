import React, { useState } from 'react';
import './HashtagInput.css';

const HashtagInput = ({ value = '', onChange, placeholder = 'Додати хештеги...' }) => {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e) => {
    let text = e.target.value;
    
    // Auto-add # for hashtags
    text = text.replace(/(\s|^)([a-zA-Zа-яА-Я0-9_]+)(?=\s|$)/g, (match, space, word) => {
      if (!word.startsWith('#')) {
        return space + '#' + word;
      }
      return match;
    });

    setInputValue(text);
    onChange(text);
  };

  const renderHashtags = () => {
    return inputValue.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="hashtag">
            {word}
          </span>
        );
      }
      return word + ' ';
    });
  };

  return (
    <div className="hashtag-input-container">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="hashtag-input"
      />
      <div className="hashtag-preview">
        {renderHashtags()}
      </div>
    </div>
  );
};

export default HashtagInput;