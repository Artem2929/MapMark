import React, { useState, useEffect } from 'react';
import './ProfileStats.css';

const ProfileStats = ({ userId, isOwnProfile }) => {
  const [stats, setStats] = useState({
    posts: 0,
    photos: 0,
    followers: 0,
    following: 0,
    reviews: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadStats();
    }
  }, [userId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Load all stats in parallel
      const [profileRes, photosRes, followersRes, followingRes] = await Promise.all([
        fetch(`http://localhost:3000/api/user/${userId}/profile`),
        Promise.resolve({ json: () => ({ success: true, data: [] }) }),
        fetch(`http://localhost:3000/api/user/${userId}/followers`),
        fetch(`http://localhost:3000/api/user/${userId}/following`)
      ]);

      const [profile, photos, followers, following] = await Promise.all([
        profileRes.json(),
        photosRes.json(),
        followersRes.json(),
        followingRes.json()
      ]);

      setStats({
        posts: profile.success ? (profile.data.posts?.length || 0) : 0,
        photos: photos.success ? (photos.data?.length || 0) : 0,
        followers: followers.success ? (followers.data?.length || 0) : 0,
        following: following.success ? (following.data?.length || 0) : 0,
        reviews: 0 // Will be implemented later
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="profile-stats">Завантаження...</div>;
  }

  return (
    <div className="profile-stats">
      <div className="profile-stats__item">
        <span className="profile-stats__number">{stats.posts}</span>
        <span className="profile-stats__label">постів</span>
      </div>
      <div className="profile-stats__item">
        <span className="profile-stats__number">{stats.photos}</span>
        <span className="profile-stats__label">фото</span>
      </div>
      <div className="profile-stats__item">
        <span className="profile-stats__number">{stats.followers}</span>
        <span className="profile-stats__label">підписників</span>
      </div>
      <div className="profile-stats__item">
        <span className="profile-stats__number">{stats.following}</span>
        <span className="profile-stats__label">підписок</span>
      </div>
    </div>
  );
};

export default ProfileStats;