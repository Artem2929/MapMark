import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import messagesService from '../../services/messagesService';
import './ProfileStats.css';

const ProfileStats = ({ 
  userId, 
  isOwnProfile, 
  onRefresh, 
  onStatsReady, 
  photos = [], 
  following = [], 
  followers = [], 
  posts = [] 
}) => {
  const [stats, setStats] = useState({
    posts: 0,
    photos: 0,
    followers: 0,
    following: 0,
    messages: 0,
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

  // Update counts when data changes
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      following: following.length || 0,
      followers: followers.length || 0,
      posts: posts.length || 0
    }));
  }, [following.length, followers.length, posts.length]);

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
      // Завантажуємо кількість повідомлень
      const conversations = await messagesService.getConversations();
      const messageCount = conversations.length;
      
      setStats(prev => ({
        ...prev,
        messages: messageCount,
        reviews: 0 // Will be implemented later
      }));
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(prev => ({
        ...prev,
        messages: 0,
        reviews: 0
      }));
    }
  };

  const navigate = useNavigate();

  const updatePhotoCount = useCallback((increment = 1) => {
    setStats(prev => ({
      ...prev,
      photos: prev.photos + increment
    }));
  }, []);

  const handlePostsClick = () => {
    const wallElement = document.querySelector('.wall-container');
    if (wallElement) {
      wallElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePhotosClick = () => {
    navigate('/photos');
  };

  const handleMessagesClick = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentUserId = payload.id;
      
      if (isOwnProfile) {
        navigate(`/messages/${currentUserId}`);
      } else {
        // Для чужого профілю - створити розмову з цим користувачем
        navigate(`/messages/${currentUserId}`, { state: { startChatWithUser: userId } });
      }
    }
  };

  if (loading) {
    return <div className="profile-stats">Завантаження...</div>;
  }

  return (
    <div className="profile-stats">
      <div className="profile-stats__item" onClick={handlePostsClick}>
        <span className="profile-stats__number">{stats.posts}</span>
        <span className="profile-stats__label">постів</span>
      </div>
      <div className="profile-stats__item" onClick={handlePhotosClick}>
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
      <div className="profile-stats__item" onClick={handleMessagesClick}>
        <span className="profile-stats__number">{stats.messages}</span>
        <span className="profile-stats__label">повідомлення</span>
      </div>
    </div>
  );
};

export default ProfileStats;