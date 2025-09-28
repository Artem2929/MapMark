import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useUserProfile from '../hooks/useUserProfile';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
import ProfileStats from '../components/ui/ProfileStats';
import BioSection from '../components/ui/BioSection';

import ActivityStats from '../components/ui/ActivityStats';
import UserAchievements from '../components/ui/UserAchievements';
import Wall from '../components/ui/Wall';


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
  const { user, loading } = useUserProfile(targetUserId);
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
    }
  }, [user, userId, currentUserId, navigate]);

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
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserState(prev => ({ ...prev, avatar: e.target.result }));
        showToast('Аватар оновлено! Не забудьте зберегти зміни.', 'info');
      };
      reader.readAsDataURL(file);
      setAvatarFile(file);
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
              <div className="profile-avatar-container">
                <div className="profile-avatar-large">
                  {userState.avatar ? (
                    <img src={userState.avatar} alt={userState.name} className="profile-avatar-image" />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {userState.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="profile-online-indicator">
                    <div className={`profile-online-dot ${Math.random() > 0.5 ? 'online' : 'offline'}`}></div>
                    <span className="profile-online-text">
                      {Math.random() > 0.5 ? 'Онлайн' : 'Був 2 год тому'}
                    </span>
                  </div>
                  {isOwnProfile && (
                    <>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="profile-avatar-input"
                      />
                      <label htmlFor="avatar-upload" className="profile-avatar-upload-btn">
                        📷
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="profile-profile-info">
              <div className="profile-profile-text-info">
                {isEditing ? (
                  <div className="profile-profile-name">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="profile-name-input"
                      placeholder="Введіть ім'я"
                      style={{flex: 1, margin: 0}}
                    />
                    {isOwnProfile && (
                      <button 
                        onClick={handleEditToggle} 
                        className="profile-main-edit-btn"
                        disabled={saving}
                      >
                        {saving ? '⏳' : '✓'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="profile-profile-name">
                    <span>{userState.name}</span>
                    {isOwnProfile && (
                      <button 
                        onClick={handleEditToggle} 
                        className="profile-main-edit-btn"
                        disabled={saving}
                      >
                        ✏️ Редагувати
                      </button>
                    )}
                  </div>
                )}
                
                <div className="profile-profile-username">{userState.username}</div>
                
                <div className="profile-status">
                  {userState.bio || "Статус не встановлено"}
                </div>
                
                <div className="profile-info-row">
                  <span className="profile-info-label">Місто:</span>
                  <span className="profile-info-value">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedCity}
                        onChange={(e) => setEditedCity(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="profile-city-input"
                        placeholder="Введіть місто"
                      />
                    ) : (
                      `${editedCity}, ${userState.country}`
                    )}
                  </span>
                </div>
                
                <div className="profile-info-row">
                  <span className="profile-info-label">Дата рег.:</span>
                  <span className="profile-info-value">{getJoinedDate(userState.joinedAt)}</span>
                </div>
                
                <div className="profile-info-row">
                  <span className="profile-info-label">Відгуків:</span>
                  <span className="profile-info-value">{userState.stats.posts}</span>
                </div>
                
                {!isOwnProfile && (
                  <div className="profile-contact-info">
                    <div className="profile-contact-row">
                      <a href="#" className="profile-contact-link">Написати повідомлення</a>
                    </div>
                    <div className="profile-contact-row">
                      <a href="#" className="profile-contact-link">Додати в друзі</a>
                    </div>
                  </div>
                )}
              </div>
              
              {!isOwnProfile && (
                <div className="profile-profile-actions">
                  <button 
                    onClick={handleFollowToggle}
                    className={`profile-follow-btn ${isFollowing ? 'profile-following' : ''}`}
                  >
                    {isFollowing ? '✓ Підписано' : 'Підписатися'}
                  </button>
                  <button 
                    onClick={() => navigate('/messages')}
                    className="profile-message-btn"
                  >
                    💬 Повідомлення
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <ProfileStats 
          stats={userState.stats}
          onStatClick={(statType) => {
            if (statType === 'messages') {
              navigate('/messages');
            } else if (statType === 'posts') {
              // Scroll to reviews section or navigate to reviews page
              console.log('Show user reviews');
            } else if (statType === 'followers') {
              navigate(`/user/${userState.id}/followers`);
            } else if (statType === 'following') {
              navigate(`/user/${userState.id}/following`);
            }
          }}
        />
        </div>

        <ActivityStats userId={targetUserId} />
        
        <UserAchievements userId={targetUserId} />
        
        <Wall userId={targetUserId} isOwnProfile={isOwnProfile} />

      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      </div>
      
      <Footer />
    </>
  );
};

export default UserProfile;