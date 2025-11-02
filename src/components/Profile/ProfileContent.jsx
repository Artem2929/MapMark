import React from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import ServicesSection from './ServicesSection';
import PhotosSection from './PhotosSection';

const ProfileContent = () => {
  const { user, services, isOwnProfile, targetUserId, addService } = useProfile();

  if (!user) return null;

  return user.role === 'seller' ? (
    <ServicesSection 
      userId={targetUserId}
      isOwnProfile={isOwnProfile}
      services={services}
      onServiceAdded={addService}
    />
  ) : (
    <PhotosSection />
  );
};

export default ProfileContent;