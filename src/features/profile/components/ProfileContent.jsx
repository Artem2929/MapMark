import React from 'react'
import { useProfile } from '../../../contexts/ProfileContext'
import ProfileAvatar from './ProfileAvatar'
import ProfileBasicInfo from './ProfileBasicInfo'
import ProfileMenu from './ProfileMenu'
import './ProfileContent.css'

const ProfileContent = () => {
  const { user, isOwnProfile, updateUser } = useProfile()

  const handleAvatarChange = async (formData) => {
    return Promise.resolve()
  }

  const handleProfileUpdate = async (updatedData) => {
    try {
      await updateUser(updatedData)
    } catch (error) {
      console.error('Profile update failed:', error)
    }
  }

  // TODO: Replace with real data from API
  const profileData = {
    photos: user?.photos || [],
    following: user?.following || [],
    followers: user?.followers || [],
    posts: user?.posts || []
  }

  return (
    <div className="profile-content">
      <div className="profile-content__sidebar">
        <div className="profile-avatar-section">
          <ProfileAvatar 
            user={user}
            isOwnProfile={isOwnProfile}
            onAvatarChange={handleAvatarChange}
          />
        </div>
        
        {isOwnProfile && (
          <ProfileMenu userId={user?.id} />
        )}
      </div>
      
      <div className="profile-content__main">
        <ProfileBasicInfo 
          user={user}
          isOwnProfile={isOwnProfile}
          onUpdate={handleProfileUpdate}
          photos={profileData.photos}
          following={profileData.following}
          followers={profileData.followers}
          posts={profileData.posts}
        />
      </div>
    </div>
  )
}

export default ProfileContent