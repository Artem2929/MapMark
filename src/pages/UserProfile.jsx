import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ProfileProvider } from '../contexts/ProfileContext';
import ProfileBreadcrumbs from '../components/profile/ProfileBreadcrumbs';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileContent from '../components/profile/ProfileContent';
import ProfileSkeleton from '../components/profile/ProfileSkeleton';
import Wall from '../components/ui/Wall';
import Footer from '../components/layout/Footer';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import ErrorBoundary from '../components/ErrorBoundary';
import authService from '../services/authService';
import { useProfile } from '../contexts/ProfileContext';
import './UserProfile.css';

const UserProfileContent = () => {
  const { user, loading, targetUserId, isOwnProfile } = useProfile();

  if (loading) {
    return (
      <div className="profile-user-profile">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-user-profile">
        <div className="profile-profile-container">
          <ErrorMessage 
            title="Профіль не знайдено"
            message="Не вдалося завантажити дані профілю. Спробуйте пізніше."
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-container profile-user-profile">
        <div className="profile-profile-container">
          <ProfileBreadcrumbs />
          <ProfileHeader />
          <ProfileContent />
          <Wall userId={targetUserId} isOwnProfile={isOwnProfile} user={user} />
        </div>
      </div>
      <Footer />
    </>
  );
};

const UserProfile = () => {
  const { userId } = useParams();
  const currentUserId = authService.getCurrentUser().id;
  const targetUserId = userId || currentUserId;
  
  console.log('UserProfile - params userId:', userId, 'currentUserId:', currentUserId, 'targetUserId:', targetUserId);

  if (!currentUserId) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ErrorBoundary>
      <ProfileProvider userId={targetUserId}>
        <UserProfileContent />
      </ProfileProvider>
    </ErrorBoundary>
  );
};

export default UserProfile;