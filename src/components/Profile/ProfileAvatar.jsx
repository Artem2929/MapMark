import React, { useState, useRef } from 'react';
import { updateAvatar } from '../../api/profileEndpoints';
import './ProfileAvatar.css';

const ProfileAvatar = ({ 
  user, 
  isOwnProfile = false, 
  onAvatarChange 
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
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

    // Створення preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    
    try {
      const userId = localStorage.getItem('userId');
      const result = await updateAvatar(userId, selectedFile);
      
      if (result.success && onAvatarChange) {
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        await onAvatarChange(formData);
      }
      
      setPreviewUrl(null);
      setSelectedFile(null);
      URL.revokeObjectURL(previewUrl);
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

  const avatarUrl = user?.avatar ? `http://localhost:3000${user.avatar}` : null;
  const displayImage = previewUrl || avatarUrl;
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="profile-avatar-container">
      <div 
        className="profile-avatar-large"
        onClick={handleAvatarClick}
      >
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={user?.name || 'Avatar'} 
            className="profile-avatar-image" 
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
    </div>
  );
};

export default ProfileAvatar;