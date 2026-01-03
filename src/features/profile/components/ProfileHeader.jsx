import { memo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import PhotosSection from './PhotosSection'
import ProfileEditForm from '../../../components/forms/ProfileEditForm'
import AvatarUploadModal from '../../../components/forms/AvatarUploadModal'
import ProfileAvatar from './ProfileAvatar'
import ProfileMenu from './ProfileMenu'
import ProfileDetails from './ProfileDetails'
import ProfileBio from './ProfileBio'
import ProfileStats from './ProfileStats'
import { useProfileEdit } from '../hooks/useProfileEdit'
import { useFollowToggle } from '../hooks/useFollowToggle'
import { profileService } from '../services/profileService'
import './ProfileHeader.css'

const ProfileHeader = memo(({ user, isOwnProfile, onUserUpdate, onEditingStateChange }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const { saveProfile } = useProfileEdit(user)
  const { isFollowing, isLoading: followLoading, toggleFollow } = useFollowToggle(user, onUserUpdate)
  
  if (!user) return null

  const handleAvatarUpload = useCallback(async (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const result = await profileService.uploadAvatar(formData)
    if (onUserUpdate && result.data?.user) {
      onUserUpdate(result.data.user)
    }
  }, [onUserUpdate])

  const handleEditProfile = useCallback(() => {
    setIsEditing(true)
    if (onEditingStateChange) onEditingStateChange(true)
  }, [onEditingStateChange])

  const handleSaveProfile = useCallback(async (profileData) => {
    const updatedUser = await saveProfile(profileData)
    if (onUserUpdate) {
      onUserUpdate(updatedUser.data.user)
    }
    setIsEditing(false)
    if (onEditingStateChange) onEditingStateChange(false)
  }, [saveProfile, onUserUpdate, onEditingStateChange])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    if (onEditingStateChange) onEditingStateChange(false)
  }, [onEditingStateChange])

  const handleAvatarModalOpen = useCallback(() => {
    setShowAvatarModal(true)
  }, [])

  const handleAvatarModalClose = useCallback(() => {
    setShowAvatarModal(false)
  }, [])

  if (isEditing) {
    return (
      <ProfileEditForm
        user={user}
        onSave={handleSaveProfile}
        onCancel={handleCancelEdit}
      />
    )
  }

  return (
    <div className="profile-header">
      <div className="profile-header__content">
        <div className="profile-header__left">
          <ProfileAvatar
            avatar={user.avatar}
            name={user.name}
            isOwnProfile={isOwnProfile}
            onEditClick={handleAvatarModalOpen}
          />
          
          {isOwnProfile && (
            <ProfileMenu userId={user.id} onEditClick={handleEditProfile} />
          )}
        </div>
        
        <div className="profile-header__info">
          <div className="profile-header__name-wrapper">
            <h1 className="profile-header__name">
              {user.name}{user.surname ? ` ${user.surname}` : ''}
            </h1>
            {user.isOnline && <span className="profile-header__online">online</span>}
          </div>
          
          <ProfileDetails 
            user={user} 
            isOwnProfile={isOwnProfile} 
            onEditClick={handleEditProfile} 
          />
          
          <ProfileBio 
            bio={user.bio} 
            isOwnProfile={isOwnProfile} 
            onEditClick={handleEditProfile} 
          />
          
          <PhotosSection key={user.id} userId={user.id} isOwnProfile={isOwnProfile} />
        </div>
        
        <div className="profile-header__actions profile-header__actions--hidden">
          {isOwnProfile ? (
            <button className="profile-header__edit-btn" onClick={handleEditProfile}>
              Редагувати профіль
            </button>
          ) : (
            <>
              <button 
                className={`profile-header__follow-btn ${isFollowing ? 'profile-header__follow-btn--following' : ''}`}
                onClick={toggleFollow}
                disabled={followLoading}
                aria-label={isFollowing ? 'Відписатися' : 'Підписатися'}
              >
                {followLoading ? 'Завантаження...' : isFollowing ? 'Відписатися' : 'Підписатися'}
              </button>
              <Link to={`/messages/${user.id}`} className="profile-header__message-btn">
                Написати
              </Link>
            </>
          )}
        </div>
      </div>
      
      <ProfileStats 
        postsCount={user.postsCount}
        followingCount={user.followingCount}
        followersCount={user.followersCount}
      />
      
      {showAvatarModal && (
        <AvatarUploadModal
          onClose={handleAvatarModalClose}
          onUpload={handleAvatarUpload}
          currentAvatar={user.avatar}
        />
      )}
    </div>
  )
})

ProfileHeader.displayName = 'ProfileHeader'

export default ProfileHeader