import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useUserProfile from '../hooks/useUserProfile';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';

import BioSection from '../components/ui/BioSection';

import ActivityStats from '../components/ui/ActivityStats';
import UserAchievements from '../components/ui/UserAchievements';
import Wall from '../components/ui/Wall';
import ProfileAvatar from '../components/Profile/ProfileAvatar';
import ProfileBasicInfo from '../components/Profile/ProfileBasicInfo';
import ProfileMenu from '../components/Profile/ProfileMenu';



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
                    const response = await fetch(`http://localhost:3000/api/avatar/${targetUserId}`, {
                      method: 'PUT',
                      body: formData
                    });
                    const result = await response.json();
                    if (result.success) {
                      const avatarUrl = `http://localhost:3000${result.data.avatarUrl}`;
                      setUserState(prev => ({ ...prev, avatar: avatarUrl }));
                      refreshProfile();
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
            </div>
          </div>
          

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