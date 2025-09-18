import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
import UserAvatarLarge from '../components/ui/UserAvatarLarge';
import UserStats from '../components/ui/UserStats';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      const mockUser = {
        id: userId,
        name: 'John Doe',
        username: '@johndoe',
        avatar: null,
        country: 'Швейцарія',
        city: 'Цюрих',
        joinedAt: '2024-04-12',
        bio: 'Люблю гори, подорожі та фотографію. Завжди в пошуках нових пригод! 🏔️📸',
        stats: {
          posts: 12,
          likes: 340,
          followers: 102,
          following: 33
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
      setLoading(false);
    }, 1000);
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

  if (loading) {
    return (
      <div className="user-profile">
        <div className="profile-container">
          <div className="loading-skeleton">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-stats"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile">
        <div className="profile-container">
          <div className="user-not-found">
            <h2>Користувача не знайдено</h2>
            <Link to="/discover-places" className="back-link">
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
    <div className="user-profile">
      <div className="profile-container">
        <Breadcrumbs items={breadcrumbItems} />
        
        <UserAvatarLarge
          avatarUrl={user.avatar}
          fullName={user.name}
          username={user.username}
          location={`${user.city}, ${user.country}`}
          joinedAt={user.joinedAt}
          isFollowing={isFollowing}
          onFollowToggle={!isOwnProfile ? handleFollowToggle : undefined}
          onMessage={!isOwnProfile ? () => console.log('Message clicked') : undefined}
        />

        <UserStats 
          stats={user.stats}
          onStatClick={(statType) => console.log(`Clicked on ${statType}`)}
        />

        <div className="bio-section">
          <h3>Про себе</h3>
          {user.bio ? (
            <p className="bio-text">{user.bio}</p>
          ) : (
            <p className="bio-placeholder">Користувач ще не додав інформацію про себе.</p>
          )}
        </div>

        <div className="user-posts-section">
          <h3>Пости ({user.posts.length})</h3>
          {user.posts.length > 0 ? (
            <div className="posts-grid">
              {user.posts.map(post => (
                <Link 
                  key={post.id} 
                  to={`/post/${post.id}`} 
                  className="post-card"
                  aria-label={`Перейти до посту ${post.title}`}
                >
                  <div className="post-image-container">
                    <img src={post.image} alt={post.title} className="post-image" />
                    <div className="post-overlay">
                      <div className="post-stats">
                        <span className="post-likes">❤️ {post.likes}</span>
                        <span className="post-rating">⭐ {post.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="post-info">
                    <h4 className="post-title">{post.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-posts">
              <div className="empty-posts-icon">💤</div>
              <p className="empty-posts-text">Ще немає публікацій</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfile;