import React, { useState, useRef } from 'react';

const PostCreator = ({ onCreatePost, user }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mood, setMood] = useState('');
  const [location, setLocation] = useState('');
  const fileInputRef = useRef(null);

  const moods = [
    { id: 'happy', emoji: '😊', label: 'Щасливий' },
    { id: 'excited', emoji: '🤩', label: 'Захоплений' },
    { id: 'grateful', emoji: '🙏', label: 'Вдячний' },
    { id: 'relaxed', emoji: '😌', label: 'Розслаблений' },
    { id: 'thoughtful', emoji: '🤔', label: 'Задумливий' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    onCreatePost({
      content: content.trim(),
      images,
      mood,
      location: location.trim()
    });

    setContent('');
    setImages([]);
    setIsExpanded(false);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            url: e.target.result,
            file
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setContent('');
    setImages([]);
    setMood('');
    setLocation('');
    setIsExpanded(false);
  };

  return (
    <div className="post-creator">
      <form onSubmit={handleSubmit}>
        <div className="creator-header">
          <div className="creator-avatar">
            {user?.avatar ? (
              <img 
                src={user.avatar.startsWith('data:') || user.avatar.startsWith('http') 
                  ? user.avatar 
                  : `http://localhost:3000${user.avatar}`} 
                alt="Аватар" 
              />
            ) : (
              <div className="avatar-placeholder">{user?.name?.charAt(0) || 'U'}</div>
            )}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={handleFocus}
            placeholder="Що у вас нового?"
            className={`creator-input ${isExpanded ? 'expanded' : ''}`}
            rows={isExpanded ? 3 : 1}
          />
        </div>

        {images.length > 0 && (
          <div className="creator-images">
            {images.map(image => (
              <div key={image.id} className="creator-image">
                <img src={image.url} alt="Upload preview" />
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="remove-image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {isExpanded && (
          <div className="creator-actions">
            <div className="creator-tools">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="tool-btn"
                title="Додати фото"
              >
                📷
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
            
            <div className="creator-buttons">
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-btn"
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={!content.trim()}
                className="publish-btn"
              >
                Опублікувати
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default PostCreator;