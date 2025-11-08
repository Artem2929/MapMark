import React, { createContext, useContext, useMemo } from 'react';
import useUserProfile from '../hooks/useUserProfile';
import useUserPhotos from '../hooks/useUserPhotos';
import useUserFollowing from '../hooks/useUserFollowing';
import useUserFollowers from '../hooks/useUserFollowers';
import useUserWall from '../hooks/useUserWall';
import useUserServices from '../hooks/useUserServices';
import authService from '../services/authService';

const ProfileContext = createContext();

export const ProfileProvider = ({ children, userId }) => {
  const currentUserId = authService.getCurrentUser().id;
  const profile = useUserProfile(userId);
  const photos = useUserPhotos(userId);
  const following = useUserFollowing(userId);
  const followers = useUserFollowers(userId);
  const wallData = useUserWall(userId, currentUserId);
  const { services, addService } = useUserServices(userId);

  const value = useMemo(() => ({
    ...profile,
    photos: photos.photos || [],
    photosLoading: photos.loading,
    refreshPhotos: photos.refreshPhotos,
    addPhoto: photos.addPhoto,
    following,
    followers,
    posts: wallData.posts || [],
    wallLoading: wallData.loading,
    refreshWall: wallData.refreshWall,
    addPost: wallData.addPost,
    services,
    addService,
    isOwnProfile: userId === currentUserId,
    currentUserId,
    targetUserId: userId
  }), [profile, photos, following, followers, wallData, services, addService, userId, currentUserId]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
};