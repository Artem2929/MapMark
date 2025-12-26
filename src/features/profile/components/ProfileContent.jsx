import React from 'react'
import { useProfile } from '../../../contexts/ProfileContext'
import ProfileAvatar from './ProfileAvatar'
import ProfileBasicInfo from './ProfileBasicInfo'
import ProfileMenu from './ProfileMenu'
import './ProfileContent.css'

const ProfileContent = () => {
  const { user, isOwnProfile, updateUser } = useProfile()

  const handleAvatarChange = async (formData) => {
    // TODO: Implement avatar upload
    console.log('Avatar upload:', formData)
  }

  const handleProfileUpdate = async (updatedData) => {
    // TODO: Implement profile update
    console.log('Profile update:', updatedData)
    updateUser(updatedData)
  }

  const handleStatsRefresh = () => {
    // TODO: Implement stats refresh
    console.log('Stats refresh')
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
          onStatsRefresh={handleStatsRefresh}
          photos={[]}
          following={[]}
          followers={[]}
          posts={[]}
        />
      </div>
    </div>
  )
}

export default ProfileContent