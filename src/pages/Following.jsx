import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
import './Followers.css';

const Following = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      const mockUser = {
        id: userId,
        name: 'John Doe',
        username: '@johndoe'
      };

      const mockFollowing = [
        {
          id: 1,
          name: 'Travel Ukraine',
          username: '@travel_ukraine',
          avatar: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=60&h=60&fit=crop',
          bio: 'Найкращі місця України для подорожей 🇺🇦',
          isFollowing: true,
          mutualFollowers: 25
        },
        {
          id: 2,
          name: 'Mountain Explorer',
          username: '@mountain_explorer',
          avatar: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=60&h=60&fit=crop',
          bio: 'Гірські пригоди та альпінізм ⛰️',
          isFollowing: true,
          mutualFollowers: 8
        }
      ];

      setUser(mockUser);
      setFollowing(mockFollowing);
      setLoading(false);
    }, 300);
  }, [userId]);

  const handleUnfollow = (followingId) => {
    setFollowing(following.filter(f => f.id !== followingId));
  };

  const breadcrumbItems = [
    { label: 'Головна', link: '/' },
    { label: loading ? 'Завантаження...' : user?.name || 'Користувач', link: `/user/${userId}` },
    { label: 'Підписки' }
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
              <h1 className="followers-title">Підписки</h1>
              <div className="followers-count">{following.length} підписок</div>
            </div>

            <div className="followers-list">
              {following.map(followingUser => (
                <div key={followingUser.id} className="follower-item">
                  <Link to={`/user/${followingUser.id}`} className="follower-info">
                    <div className="follower-avatar">
                      {followingUser.avatar ? (
                        <img src={followingUser.avatar} alt={followingUser.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {followingUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className="follower-details">
                      <h3 className="follower-name">{followingUser.name}</h3>
                      <p className="follower-username">{followingUser.username}</p>
                      {followingUser.bio && <p className="follower-bio">{followingUser.bio}</p>}
                      {followingUser.mutualFollowers > 0 && (
                        <p className="mutual-followers">
                          {followingUser.mutualFollowers} спільних підписників
                        </p>
                      )}
                    </div>
                  </Link>
                  
                  <button 
                    onClick={() => handleUnfollow(followingUser.id)}
                    className="follow-btn following"
                  >
                    Відписатися
                  </button>
                </div>
              ))}
            </div>

            {following.length === 0 && (
              <div className="empty-followers">
                <h3>Поки що немає підписок</h3>
                <p>Підпишіться на інших користувачів, щоб вони з'явились тут</p>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Following;