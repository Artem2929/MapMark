import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
import UserAvatarLarge from '../components/ui/UserAvatarLarge';
import UserStats from '../components/ui/UserStats';
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

  useEffect(() => {
    const currentUserId = localStorage.getItem('userId');
    
    // If no current user, redirect to login
    if (!currentUserId) {
      navigate('/login', { replace: true });
      return;
    }
    
    const fetchUserData = async () => {
      try {
        // Always use current user ID
        const profileResponse = await fetch(`http://localhost:3000/api/user/${currentUserId}/profile`);
        const profileData = await profileResponse.json();
        
        if (profileData.success) {
          setUser(profileData.data);
          setEditedName(profileData.data.name);
          setEditedCity(profileData.data.city);
          setEditedBio(profileData.data.bio || '');
        } else {
          throw new Error('Profile not found');
        }
        
        setIsOwnProfile(true);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

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

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUser(prev => ({ ...prev, avatar: e.target.result }));
      };
      reader.readAsDataURL(file);
      setAvatarFile(file);
    }
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        const currentUserId = localStorage.getItem('userId');
        const response = await fetch(`http://localhost:3000/api/user/${currentUserId}/profile`, {
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
        } else {
          console.error('Failed to update profile:', result.message);
        }
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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
          <div className="profile-loading-skeleton">
            <div className="profile-skeleton-avatar"></div>
            <div className="profile-skeleton-text"></div>
            <div className="profile-skeleton-stats"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-user-profile">
        <div className="profile-profile-container">
          <div className="profile-user-not-found">
            <h2>Користувача не знайдено</h2>
            <Link to="/discover-places" className="profile-back-link">
              Повернутися до постів
            </Link>
          </div>
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
                
                <div className="profile-bio-section">
                  <h4 className="profile-bio-label">Про себе</h4>
                  {isEditing ? (
                    <textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="profile-bio-input"
                      placeholder="Розкажіть про себе..."
                      rows="3"
                    />
                  ) : (
                    <p className="profile-bio">{user.bio || 'Не вказано'}</p>
                  )}
                </div>
              </div>
              
              {isOwnProfile && (
                <button onClick={handleEditToggle} className="profile-main-edit-btn">
                  {isEditing ? '✓ Зберегти' : '✏️ Редагувати'}
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

        <UserStats 
          stats={user.stats}
          onStatClick={(statType) => {
            if (statType === 'messages') {
              navigate('/messages');
            } else if (statType === 'posts') {
              document.querySelector('.profile-posts-section')?.scrollIntoView({ behavior: 'smooth' });
            } else if (statType === 'followers') {
              navigate(`/user/${user.id}/followers`);
            } else if (statType === 'following') {
              navigate(`/user/${user.id}/following`);
            }
          }}
        />


      </div>
      <Footer />
    </div>
  );
};

export default UserProfile;