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
    const fetchUserData = async () => {
      try {
        // Fetch user stats from API
        const statsResponse = await fetch(`http://localhost:3000/api/user/${userId}/stats`);
        const statsData = await statsResponse.json();
        
        const mockUser = {
          id: userId,
          name: 'John Doe',
          username: '@johndoe',
          avatar: null,
          country: 'Швейцарія',
          city: 'Цюрих',
          joinedAt: '2024-04-12',
          bio: 'Люблю гори, подорожі та фотографію. Завжди в пошуках нових пригод! 🏔️📸',
          stats: statsData.success ? statsData.data : {
            messages: 0,
            posts: 0,
            followers: 0,
            following: 0
          },
        posts: [
          {
            id: 1,
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
            title: 'Swiss Alps Adventure',
            rating: 4.8,
            likes: 234
          },
          {
            id: 2,
            image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop',
            title: 'Paris Evening',
            rating: 4.7,
            likes: 189
          },
          {
            id: 3,
            image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=300&h=300&fit=crop',
            title: 'Tropical Paradise',
            rating: 4.9,
            likes: 456
          }
        ]
      };
        setUser(mockUser);
        setIsOwnProfile(localStorage.getItem('userId') === userId);
        setEditedName(mockUser.name);
        setEditedCity(mockUser.city);
        setEditedBio(mockUser.bio || '');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to mock data if API fails
        const mockUser = {
          id: userId,
          name: 'John Doe',
          username: '@johndoe',
          avatar: null,
          country: 'Швейцарія',
          city: 'Цюрих',
          joinedAt: '2024-04-12',
          bio: 'Люблю гори, подорожі та фотографію. Завжди в пошуках нових пригод! 🏔️📸',
          stats: { messages: 0, posts: 0, followers: 0, following: 0 },
          posts: []
        };
        setUser(mockUser);
        setIsOwnProfile(localStorage.getItem('userId') === userId);
        setEditedName(mockUser.name);
        setEditedCity(mockUser.city);
        setEditedBio(mockUser.bio || '');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);

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

  const handleEditToggle = () => {
    if (isEditing) {
      // Зберігаємо зміни
      setUser(prev => ({ 
        ...prev, 
        name: editedName,
        city: editedCity,
        bio: editedBio
      }));
      setIsEditing(false);
    } else {
      // Входимо в режим редагування
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

        <div className="profile-posts-section">
          <h3 className="profile-posts-title">Пости</h3>
          <div className="profile-posts-grid">
            {user.posts.map(post => (
              <div key={post.id} className="profile-post-card">
                <img src={post.image} alt={post.title} className="profile-post-image" />
                <div className="profile-post-info">
                  <h4 className="profile-post-title">{post.title}</h4>
                  <div className="profile-post-stats">
                    <span className="profile-post-rating">⭐ {post.rating}</span>
                    <span className="profile-post-likes">❤️ {post.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfile;