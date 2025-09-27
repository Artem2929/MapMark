import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
import ProfileStats from '../components/ui/ProfileStats';
import BioSection from '../components/ui/BioSection';
import UserReviews from '../components/ui/UserReviews';
import ActivityStats from '../components/ui/ActivityStats';
import ProfileActions from '../components/ui/ProfileActions';
import UserAchievements from '../components/ui/UserAchievements';
import UserMap from '../components/ui/UserMap';
import ProfileExport from '../components/ui/ProfileExport';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import Toast from '../components/ui/Toast';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
    const currentUserId = localStorage.getItem('userId');
    
    // If no current user, redirect to login
    if (!currentUserId) {
      navigate('/login', { replace: true });
      return;
    }
    
    const fetchUserData = async () => {
      try {
        // Use userId from URL params or current user ID
        const targetUserId = userId || currentUserId;
        const profileResponse = await fetch(`http://localhost:3000/api/user/${targetUserId}/profile`);
        const profileData = await profileResponse.json();
        
        if (profileData.success) {
          setUser(profileData.data);
          setEditedName(profileData.data.name);
          setEditedCity(profileData.data.city);
          setEditedBio(profileData.data.bio || '');
        } else {
          throw new Error('Profile not found');
        }
        
        setIsOwnProfile(!userId || userId === currentUserId);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback: create mock user data when server is not available
        const currentUserId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName') || 'Користувач';
        const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
        
        const mockUser = {
          id: currentUserId,
          name: userName,
          username: `@${userName.toLowerCase().replace(/\s+/g, '')}`,
          avatar: null,
          city: 'Київ',
          country: 'Україна',
          bio: 'Привіт! Я новий користувач MapMark 👋',
          joinedAt: new Date().toISOString(),
          stats: {
            posts: 0,
            followers: 0,
            following: 0,
            messages: 0
          }
        };
        
        setUser(mockUser);
        setEditedName(mockUser.name);
        setEditedCity(mockUser.city);
        setEditedBio(mockUser.bio);
        setIsOwnProfile(!userId || userId === currentUserId);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId, navigate]);

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
        setUser(prev => ({ ...prev, avatar: e.target.result }));
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
        const currentUserId = localStorage.getItem('userId');
        const targetUserId = userId || currentUserId;
        const response = await fetch(`http://localhost:3000/api/user/${targetUserId}/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editedName,
            city: editedCity,
            country: user.country,
            bio: editedBio
          })
        });
        
        const result = await response.json();
        if (result.success) {
          setUser(prev => ({ 
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
        setUser(prev => ({ 
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
      setEditedName(user.name);
      setEditedCity(user.city);
      setEditedBio(user.bio || '');
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

  if (!user) {
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
    { label: user.name }
  ];

  return (
    <div className="profile-user-profile">
      <div className="profile-profile-container">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="profile-profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar-container">
              <div className="profile-avatar-large">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="profile-avatar-image" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
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
            <div className="profile-profile-header-top">
              <div className="profile-profile-text-info">
                <div className="profile-name-section">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="profile-name-input"
                      placeholder="Введіть ім'я"
                    />
                  ) : (
                    <h1 className="profile-profile-name">{user.name}</h1>
                  )}
                </div>
                
                <p className="profile-profile-username">{user.username}</p>
                
                <div className="profile-location-section">
                  {isEditing ? (
                    <div className="profile-location-edit">
                      📍 
                      <input
                        type="text"
                        value={editedCity}
                        onChange={(e) => setEditedCity(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="profile-city-input"
                        placeholder="Введіть місто"
                      />
                      , {user.country}
                    </div>
                  ) : (
                    <p className="profile-profile-location">
                      📍 {editedCity}, {user.country}
                    </p>
                  )}
                </div>
                
                <p className="profile-profile-joined">
                  📅 Приєднався {getJoinedDate(user.joinedAt)}
                </p>
                

              </div>
              
              {isOwnProfile && (
                <button 
                  onClick={handleEditToggle} 
                  className="profile-main-edit-btn"
                  disabled={saving}
                >
                  {saving ? '⏳ Зберігання...' : isEditing ? '✓ Зберегти' : '✏️ Редагувати'}
                </button>
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
          stats={user.stats}
          onStatClick={(statType) => {
            if (statType === 'messages') {
              navigate('/messages');
            } else if (statType === 'posts') {
              // Scroll to reviews section or navigate to reviews page
              console.log('Show user reviews');
            } else if (statType === 'followers') {
              navigate(`/user/${user.id}/followers`);
            } else if (statType === 'following') {
              navigate(`/user/${user.id}/following`);
            }
          }}
        />
        
        <BioSection
          bio={user.bio}
          isEditing={isEditing}
          editedBio={editedBio}
          setEditedBio={setEditedBio}
          onKeyPress={handleKeyPress}
        />
        
        <ProfileActions 
          isOwnProfile={isOwnProfile}
          onEditProfile={() => setIsEditing(!isEditing)}
        />
        
        <ActivityStats userId={user.id} />
        
        <UserAchievements userId={user.id} />
        
        <UserMap userId={user.id} />
        
        <UserReviews userId={user.id} />
        
        {isOwnProfile && <ProfileExport userId={user.id} />}
      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default UserProfile;