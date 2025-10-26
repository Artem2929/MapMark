import React, { useState, useEffect, useCallback } from 'react';
import useUserPhotos from '../../hooks/useUserPhotos';
import useUserFollowing from '../../hooks/useUserFollowing';
import useUserFollowers from '../../hooks/useUserFollowers';
import './ProfileStats.css';

const ProfileStats = ({ userId, isOwnProfile, onRefresh, onStatsReady }) => {
  const { photos } = useUserPhotos(userId);
  const { following } = useUserFollowing(userId);
  const { followers } = useUserFollowers(userId);
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

  // Update following count when following changes
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      following: following.length || 0
    }));
  }, [following.length]);

  // Update followers count when followers change
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      followers: followers.length || 0
    }));
  }, [followers.length]);

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
      
      // Load only posts (photos, following, followers are loaded via hooks)
      const postsRes = await fetch(`http://localhost:3000/api/posts/${userId}`);
      const posts = await postsRes.json();

      setStats(prev => ({
        ...prev,
        posts: posts.success ? (posts.posts?.length || 0) : 0,
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