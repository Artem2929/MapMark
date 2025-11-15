import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
import './Followers.css';

const Followers = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      const mockUser = {
        id: userId,
        name: 'John Doe',
        username: '@johndoe'
      };

      const mockFollowers = [
        {
          id: 1,
          name: 'Anna Kovalenko',
          username: '@anna_k',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop',
          bio: 'Фотограф та мандрівник 📸',
          isFollowing: true,
          mutualFollowers: 5,
          isOnline: true
        },
        {
          id: 2,
          name: 'Maksym Petrenko',
          username: '@max_travel',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop',
          bio: 'Люблю гори та екстремальні види спорту 🏔️',
          isFollowing: false,
          mutualFollowers: 12,
          isOnline: false
        },
        {
          id: 3,
          name: 'Sofia Marchenko',
          username: '@sofia_adventures',
          avatar: null,
          bio: 'Завжди в пошуках нових пригод! ✈️',
          isFollowing: true,
          mutualFollowers: 3,
          isOnline: true
        }
      ];

      setUser(mockUser);
      setFollowers(mockFollowers);
      setLoading(false);
    }, 300);
  }, [userId]);

  const handleFollowToggle = (followerId) => {
    setFollowers(followers.map(follower => 
      follower.id === followerId 
        ? { ...follower, isFollowing: !follower.isFollowing }
        : follower
    ));
  };

  const breadcrumbItems = [
    { label: 'Головна', link: '/' },
    { label: loading ? 'Завантаження...' : user.name, link: `/user/${userId}` },
    { label: 'Підписники' }
  ];

  return (
    <div className="followers-page">
      <div className="followers-container">
        <Breadcrumbs items={breadcrumbItems} />
        
        {loading ? (
          <>
            <div className="followers-header">
              <div className="skeleton-title"></div>
              <div className="skeleton-count"></div>
            </div>
            <div className="followers-list">
              <div className="skeleton-follower"></div>
              <div className="skeleton-follower"></div>
              <div className="skeleton-follower"></div>
            </div>
          </>
        ) : (
          <>
            <div className="followers-header">
              <h1 className="followers-title">Підписники</h1>
              <div className="followers-count">{followers.length} підписників</div>
            </div>

            <div className="followers-search">
              <input
                type="text"
                placeholder="Пошук підписників..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="followers-list">
          {followers.filter(follower => 
            follower.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).map(follower => (
            <div key={follower.id} className="follower-item">
              <Link to={`/user/${follower.id}`} className="follower-info">
                <div className="follower-avatar">
                  {follower.avatar ? (
                    <img src={follower.avatar} alt={follower.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {follower.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={`status-indicator ${follower.isOnline ? 'online' : 'offline'}`}></div>
                </div>
                
                <div className="follower-details">
                  <h3 className="follower-name">{follower.name}</h3>
                  <p className="follower-username">{follower.username}</p>
                  {follower.bio && <p className="follower-bio">{follower.bio}</p>}
                  {follower.mutualFollowers > 0 && (
                    <p className="mutual-followers">
                      {follower.mutualFollowers} спільних підписників
                    </p>
                  )}
                </div>
              </Link>
              
              <button 
                onClick={() => handleFollowToggle(follower.id)}
                className={`follow-btn ${follower.isFollowing ? 'following' : ''}`}
              >
                {follower.isFollowing ? 'Підписано' : 'Підписатися'}
              </button>
            </div>
          ))}
        </div>

            {followers.filter(follower => 
              follower.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && searchQuery && (
              <div className="empty-followers">
                <div>🔍</div>
                <h3>Нічого не знайдено</h3>
                <p>Спробуйте змінити пошуковий запит</p>
              </div>
            )}

            {followers.length === 0 && !searchQuery && (
              <div className="empty-followers">
                <div>👥</div>
                <h3>Поки що немає підписників</h3>
                <p>Коли хтось підпишеться, вони з'являться тут</p>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Followers;