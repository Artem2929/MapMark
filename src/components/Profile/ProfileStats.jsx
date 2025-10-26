import React, { useState, useEffect, useCallback } from 'react';
import useUserPhotos from '../../hooks/useUserPhotos';
import './ProfileStats.css';

const ProfileStats = ({ userId, isOwnProfile, onRefresh, onStatsReady }) => {
  const { photos } = useUserPhotos(userId);
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

  // Update photo count when photos change
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      photos: photos.length || 0
    }));
  }, [photos.length]);

  useEffect(() => {
    if (onRefresh) {
      onRefresh(loadStats);
    }
  }, [onRefresh]);

  useEffect(() => {
    if (onStatsReady) {
      onStatsReady({ updatePhotoCount });
    }
  }, [onStatsReady]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Load stats in parallel (photos are loaded via useUserPhotos hook)
      const [postsRes, followersRes, followingRes] = await Promise.all([
        fetch(`http://localhost:3000/api/posts/${userId}`),
        fetch(`http://localhost:3000/api/user/${userId}/followers`),
        fetch(`http://localhost:3000/api/user/${userId}/following`)
      ]);

      const [posts, followers, following] = await Promise.all([
        postsRes.json(),
        followersRes.json(),
        followingRes.json()
      ]);

      setStats(prev => ({
        ...prev,
        posts: posts.success ? (posts.posts?.length || 0) : 0,
        followers: followers.success ? (followers.data?.length || 0) : 0,
        following: following.success ? (following.data?.length || 0) : 0,
        reviews: 0 // Will be implemented later
      }));
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePhotoCount = useCallback((increment = 1) => {
    setStats(prev => ({
      ...prev,
      photos: prev.photos + increment
    }));
  }, []);

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