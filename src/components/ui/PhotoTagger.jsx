import React, { useState, memo, useCallback } from 'react';
import { classNames } from '../../utils/classNames';
import './PhotoTagger.css';

const PhotoTagger = memo(({  imageUrl, tags = [], onTagsChange  }) => {
  const [isTagging, setIsTagging] = useState(false);
  const [newTag, setNewTag] = useState({ x: 0, y: 0, name: '' });
  const [showInput, setShowInput] = useState(false);

  const handleImageClick = (e) => {
    if (!isTagging) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setNewTag({ x, y, name: '' });
    setShowInput(true);
  };

  const handleTagSubmit = (e) => {
    e.preventDefault();
    if (newTag.name.trim()) {
      onTagsChange([...tags, { ...newTag, id: Date.now() }]);
      setNewTag({ x: 0, y: 0, name: '' });
      setShowInput(false);
    }
  };

  const removeTag = (tagId) => {
    onTagsChange(tags.filter(tag => tag.id !== tagId));
  };

  return (
    <div className="photo-tagger">
      <div className="photo-tagger-controls">
        <button 
          className={`tag-btn ${isTagging ? 'active' : ''}`}
          onClick={useCallback(() => setIsTagging(!isTagging), [])}
        >
          🏷️ {isTagging ? 'Готово' : 'Додати теги'}
        </button>
      </div>
      
      <div className="photo-container">
        <img 
          src={imageUrl} 
          alt="Фото для тегування"
          onClick={handleImageClick}
          className={isTagging ? 'tagging-mode' : ''}
        />
        
        {tags.map(tag => (
          <div
            key={tag.id}
            className="photo-tag"
            style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
          >
            <div className="tag-dot" />
            <div className="tag-label">
              {tag.name}
              <button 
                className="tag-remove"
                onClick={useCallback(() => removeTag(tag.id), [])}
              >
                ×
              </button>
            </div>
          </div>
        ))}
        
        {showInput && (
          <div
            className="tag-input-container"
            style={{ left: `${newTag.x}%`, top: `${newTag.y}%` }}
          >
            <form onSubmit={handleTagSubmit}>
              <input
                type="text"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                placeholder="Ім'я особи..."
                className="tag-input"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
});

PhotoTagger.displayName = 'PhotoTagger';

export default PhotoTagger;