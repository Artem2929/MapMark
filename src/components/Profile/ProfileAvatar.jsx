import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { updateAvatar } from '../../api/profileEndpoints';
import './ProfileAvatar.css';

const ProfileAvatar = ({ 
  user, 
  isOwnProfile = false, 
  onAvatarChange,
  onPhotoCountChange
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Перевірка типу файлу
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Підтримуються лише зображення JPG, PNG або WEBP');
      return;
    }

    // Перевірка розміру файлу (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Фото занадто велике. Максимальний розмір: 5MB');
      return;
    }

    // Clear previous preview if exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Створення preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    setImageError(false);
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);
      
      if (onAvatarChange) {
        await onAvatarChange(formData);
        
        // Clear preview immediately after successful upload
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setSelectedFile(null);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAvatarClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const avatarUrl = user?.avatar 
    ? (user.avatar.startsWith('data:') || user.avatar.startsWith('http') 
        ? user.avatar 
        : `http://localhost:3001${user.avatar}`)
    : null;
  const displayImage = previewUrl || avatarUrl;
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  const ProfileRatingBlock = () => {
    const rating = 4.7; // Мок даних, потім з API
    
    const getRatingColor = (rating) => {
      if (rating >= 4.5) return '#3b82f6'; // синій
      if (rating >= 3.0) return '#f59e0b'; // жовтий
      return '#ef4444'; // червоний
    };

    return (
      <div className="profile-rating-block">
        <div className="profile-rating-row">
          <span className="profile-rating-label">Рейтинг:</span>
          <div className="profile-rating-value">
            <span 
              className="profile-rating-score" 
              style={{ color: getRatingColor(rating) }}
            >
              {rating}
            </span>
            <span className="profile-rating-star">★</span>
          </div>
        </div>
      </div>
    );
  };

  const ProfileAvatarMenu = () => {
    const location = useLocation();
    
    const menuItems = [
      { path: '/friends', label: 'Мої друзі', count: user?.followers?.length || 0 },
      { path: '/messages', label: 'Повідомлення', count: 0 },
      { path: '/photos', label: 'Фото', count: user?.photos?.length || 0 }
    ];

    return (
      <nav className="profile-avatar-menu">
        <ul className="profile-avatar-menu__list">
          {menuItems.map(item => (
            <li key={item.path} className="profile-avatar-menu__item">
              <Link 
                to={item.path}
                className={`profile-avatar-menu__link ${
                  location.pathname === item.path ? 'active' : ''
                }`}
              >
                {item.label} <span className="profile-avatar-menu__count">{item.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  return (
    <div className="profile-avatar-container">
      <div 
        className="profile-avatar-large"
        onClick={handleAvatarClick}
      >
        {displayImage && !imageError ? (
          <img 
            src={displayImage} 
            alt={user?.name || 'Avatar'} 
            className="profile-avatar-image"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        ) : (
          <div className="profile-avatar-placeholder">
            {userInitial}
          </div>
        )}

        {/* Онлайн індикатор */}
        <div className="profile-online-indicator">
          <div className={`profile-online-dot ${user?.isOnline ? 'online' : 'offline'}`}></div>
          <span className="profile-online-text">
            {user?.isOnline ? 'Онлайн' : 'Офлайн'}
          </span>
        </div>

        {/* Оверлей для зміни фото */}
        {isOwnProfile && (
          <div className="profile-avatar-upload-overlay">
            <div className="profile-avatar-upload-icon">📷</div>
            <div className="profile-avatar-upload-text">
              Змінити<br/>фото
            </div>
          </div>
        )}
      </div>

      {/* Приховане поле вибору файлу */}
      {isOwnProfile && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="profile-avatar-input"
        />
      )}

      {/* Кнопки збереження/скасування */}
      {selectedFile && (
        <div className="profile-avatar-actions">
          <button 
            onClick={handleSave}
            disabled={isUploading}
            className="btn btn--primary btn--sm"
          >
            {isUploading ? 'Збереження...' : 'Зберегти'}
          </button>
          <button 
            onClick={handleCancel}
            disabled={isUploading}
            className="btn btn--secondary btn--sm"
          >
            Скасувати
          </button>
        </div>
      )}

      {/* Блок рейтингу */}
      <ProfileRatingBlock />

      {/* Вертикальне меню під фото */}
      <ProfileAvatarMenu />
    </div>
  );
};

export default ProfileAvatar;