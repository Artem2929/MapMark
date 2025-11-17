import React from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import ProfileAvatar from './ProfileAvatar';
import ProfileBasicInfo from './ProfileBasicInfo';
import FollowButton from './FollowButton';
import ProfileBadge from '../ui/ProfileBadge';
import ActivityIndicator from '../ui/ActivityIndicator';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import { useProfileActions } from '../../hooks/useProfileActions';

const ProfileHeader = () => {
  const { user, isOwnProfile, currentUserId, targetUserId, photos, following, followers, posts } = useProfile();
  const { updateAvatar } = useProfileActions();
  const { isOnline, lastSeen } = useOnlineStatus(targetUserId);

  const handleAvatarChange = async (formData) => {
    try {
      await updateAvatar(targetUserId, formData);
    } catch (error) {
      console.error('Avatar update failed:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-profile-header">
      <div className="profile-profile-header-top">
        <div className="profile-avatar-section">
          <ProfileAvatar 
            user={{
              ...user,
              isOnline: Math.random() > 0.5,
              photos: photos
            }}
            isOwnProfile={isOwnProfile}
            onAvatarChange={handleAvatarChange}
          />
        </div>
        
        <div className="profile-profile-info">
          <div className="profile-name-section">
            <h1 className="profile-profile-name">
              {user.name}
              {user.verified && <ProfileBadge type="verified" size="md" />}
              {user.premium && <ProfileBadge type="premium" size="md" />}
            </h1>
            <ActivityIndicator 
              status={isOnline ? 'online' : 'offline'} 
              lastSeen={lastSeen || user.lastSeen}
            />
          </div>
          <ProfileBasicInfo 
            user={user}
            isOwnProfile={isOwnProfile}
            photos={photos}
            following={following}
            followers={followers}
            posts={posts}
          />
          {!isOwnProfile && currentUserId && (
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <FollowButton 
                userId={currentUserId} 
                targetUserId={targetUserId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;