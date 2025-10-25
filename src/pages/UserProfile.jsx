import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useUserProfile, { clearUserProfileCache } from '../hooks/useUserProfile';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';

import BioSection from '../components/ui/BioSection';



import Wall from '../components/ui/Wall';
import ProfileAvatar from '../components/Profile/ProfileAvatar';
import ProfileBasicInfo from '../components/Profile/ProfileBasicInfo';
import ProfileMenu from '../components/Profile/ProfileMenu';

import FollowButton from '../components/Profile/FollowButton';



import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import Toast from '../components/ui/Toast';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('userId');
  const targetUserId = userId || currentUserId;
  const { user, loading, refreshProfile } = useUserProfile(targetUserId);
  const [userState, setUserState] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedCity, setEditedCity] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState([]);
  const photoInputRef = useRef(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoDescription, setPhotoDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!currentUserId) {
      navigate('/login', { replace: true });
      return;
    }
    
    if (user) {
      setUserState(user);
      setEditedName(user.name);
      setEditedCity(user.city);
      setEditedBio(user.bio || '');
      setIsOwnProfile(!userId || userId === currentUserId);
      loadPhotos();
    }
  }, [user, userId, currentUserId, navigate]);

  const loadPhotos = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/photos/user/${targetUserId}`);
      const result = await response.json();
      
      if (result.success) {
        setPhotos(result.data);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const handleAddPhotoClick = () => {
    setShowPhotoModal(true);
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Розмір файлу не повинен перевищувати 5MB', 'error');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      showToast('Можна завантажувати тільки зображення', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedPhoto({
        file,
        preview: e.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoSubmit = async () => {
    if (!selectedPhoto) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', selectedPhoto.file);
      formData.append('description', photoDescription);
      formData.append('userId', targetUserId);
      
      const response = await fetch('http://localhost:3000/api/photos/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        await loadPhotos(); // Reload photos
        showToast('Фото успішно додано!', 'success');
        handleCloseModal();
      } else {
        showToast(result.message || 'Помилка при додаванні фото', 'error');
      }
    } catch (error) {
      showToast('Помилка при додаванні фото', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCloseModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
    setPhotoDescription('');
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const event = { target: { files: [file] } };
      handlePhotoSelect(event);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const getJoinedDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('uk-UA', options);
  };

  const handleCopyUsername = async () => {
    if (user.username) {
      try {
        await navigator.clipboard.writeText(user.username);
        setShowCopyTooltip(true);
        setTimeout(() => setShowCopyTooltip(false), 2000);
      } catch (err) {
        console.error('Failed to copy username:', err);
      }
    }
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // Тут буде API виклик
  };

  const handleEditProfile = () => {
    // Перехід до редагування профілю
    console.log('Edit profile clicked');
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Розмір файлу не повинен перевищувати 5MB', 'error');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Можна завантажувати тільки зображення', 'error');
        return;
      }
      
      try {
        setSaving(true);
        showToast('Завантаження аватара...', 'info');
        
        const formData = new FormData();
        formData.append('avatar', file);
        
        const response = await fetch(`http://localhost:3000/api/avatar/${targetUserId}`, {
          method: 'PUT',
          body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
          const avatarUrl = `http://localhost:3000${result.data.avatarUrl}`;
          setUserState(prev => ({ ...prev, avatar: avatarUrl }));
          showToast('Аватар успішно оновлено!', 'success');
        } else {
          showToast('Помилка при завантаженні аватара', 'error');
        }
      } catch (error) {
        console.error('Avatar upload error:', error);
        showToast('Помилка підключення до сервера', 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      if (!validateForm()) {
        return;
      }
      
      setSaving(true);
      try {
        const response = await fetch(`http://localhost:3000/api/user/${targetUserId}/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editedName,
            city: editedCity,
            country: userState.country,
            bio: editedBio
          })
        });
        
        const result = await response.json();
        if (result.success) {
          setUserState(prev => ({ 
            ...prev, 
            name: editedName,
            city: editedCity,
            bio: editedBio
          }));
          setIsEditing(false);
          showToast('Профіль успішно оновлено!', 'success');
        } else {
          showToast('Помилка при оновленні профілю', 'error');
        }
      } catch (error) {
        // Fallback: save locally when server is not available
        setUserState(prev => ({ 
          ...prev, 
          name: editedName,
          city: editedCity,
          bio: editedBio
        }));
        setIsEditing(false);
        showToast('Профіль збережено локально (сервер недоступний)', 'info');
      } finally {
        setSaving(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const validateForm = () => {
    if (!editedName.trim()) {
      showToast('Імʼя не може бути порожнім', 'error');
      return false;
    }
    if (editedName.length > 50) {
      showToast('Імʼя не може бути довшим 50 символів', 'error');
      return false;
    }
    if (editedBio.length > 500) {
      showToast('Опис не може бути довшим 500 символів', 'error');
      return false;
    }
    return true;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleEditToggle();
    }
    if (e.key === 'Escape') {
      setEditedName(userState.name);
      setEditedCity(userState.city);
      setEditedBio(userState.bio || '');
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-user-profile">
        <div className="profile-profile-container">
          <LoadingSpinner message="Завантаження профілю..." />
        </div>
      </div>
    );
  }

  if (!userState) {
    return (
      <div className="profile-user-profile">
        <div className="profile-profile-container">
          <ErrorMessage 
            title="Профіль не знайдено"
            message="Не вдалося завантажити дані профілю. Спробуйте пізніше."
          />
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Головна', link: '/' },
    { label: 'Дослідити', link: '/discover-places' },
    { label: userState.name }
  ];

  return (
    <>
    <div className="page-container profile-user-profile">
      <div className="profile-profile-container">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="profile-profile-header">
          <div className="profile-profile-header-top">
            <div className="profile-avatar-section">
              <ProfileAvatar 
                user={{
                  ...userState,
                  isOnline: Math.random() > 0.5
                }}
                isOwnProfile={isOwnProfile}
                onAvatarChange={async (formData) => {
                  try {
                    const response = await fetch(`http://localhost:3000/api/user/${targetUserId}/avatar`, {
                      method: 'PUT',
                      body: formData
                    });
                    const result = await response.json();
                    if (result.success) {
                      console.log('Avatar response:', result.data);
                      setUserState(prev => ({ ...prev, avatar: result.data.avatarUrl }));
                      showToast('Аватар успішно оновлено!', 'success');
                    } else {
                      showToast('Помилка при завантаженні аватара', 'error');
                    }
                  } catch (error) {
                    showToast('Помилка підключення до сервера', 'error');
                  }
                }}
              />

            </div>
            
            <div className="profile-profile-info">
              <ProfileBasicInfo 
                user={userState}
                isOwnProfile={isOwnProfile}
                onUpdate={(data) => {
                  setUserState(prev => ({ ...prev, ...data }));
                  refreshProfile();
                  showToast('Інформацію оновлено', 'success');
                }}
              />
              {!isOwnProfile && currentUserId && (
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <FollowButton 
                    userId={currentUserId} 
                    targetUserId={targetUserId}
                  />
                </div>
              )}
            </div>
          </div>
          

        </div>

        <div className="profile-photos-section">
          <div className="profile-photos-header">
            <h3>Фото ({photos.length})</h3>
            {isOwnProfile && (
              <>
                <button 
                  className="add-photo-btn"
                  onClick={handleAddPhotoClick}
                >
                  <span>+</span> Додати фото
                </button>

              </>
            )}
          </div>
          <div className="profile-photos-grid">
            {photos.length > 0 ? (
              photos.slice(0, 3).map((photo, index) => (
                <div key={photo._id} className="photo-item" onClick={() => navigate('/photos')}>
                  <img src={photo.url} alt="Фото" />
                  {index === 2 && photos.length > 3 && (
                    <div className="photo-overlay">
                      <span>+{photos.length - 3}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-photos">
                <p>Немає фото</p>
                {isOwnProfile && (
                  <button 
                    className="add-first-photo-btn"
                    onClick={handleAddPhotoClick}
                  >
                    Додати перше фото
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
        
        <Wall userId={targetUserId} isOwnProfile={isOwnProfile} user={userState} />

      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {showPhotoModal && (
        <div className="photo-upload-modal" onClick={handleCloseModal}>
          <div className="photo-upload-content" onClick={(e) => e.stopPropagation()}>
            <div className="photo-upload-header">
              <h3 className="photo-upload-title">Додати нове фото</h3>
              <button className="photo-upload-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="photo-upload-body">
              {!selectedPhoto ? (
                <div 
                  className="photo-drop-zone"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => photoInputRef.current?.click()}
                >
                  <p>Перетягніть фото сюди або натисніть для вибору</p>
                </div>
              ) : (
                <>
                  <img src={selectedPhoto.preview} alt="Попередній перегляд" className="photo-preview" />
                  <textarea
                    className="photo-description"
                    placeholder="Напишіть опис..."
                    value={photoDescription}
                    onChange={(e) => setPhotoDescription(e.target.value)}
                  />
                </>
              )}
              
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
              />
              
              <div className="photo-upload-actions">
                <button 
                  className="photo-upload-btn secondary" 
                  onClick={handleCloseModal}
                >
                  Скасувати
                </button>
                <button 
                  className="photo-upload-btn primary" 
                  onClick={handlePhotoSubmit}
                  disabled={!selectedPhoto || uploading}
                >
                  {uploading ? 'Завантаження...' : 'Опублікувати'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      
      <Footer />
    </>
  );
};

export default UserProfile;