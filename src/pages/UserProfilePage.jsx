import { useParams, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../app/store'
import { Header, ErrorMessage } from '../components/ui'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ProfileProvider, useProfile } from '../contexts/ProfileContext'
import ProfileHeader from '../features/profile/components/ProfileHeader'
import ProfileSkeleton from '../features/profile/components/ProfileSkeleton'
import Wall from '../features/profile/components/Wall'
import PhotosSection from '../features/profile/components/PhotosSection'
import FriendsSection from '../features/profile/components/FriendsSection'
import '../features/profile/components/Profile.css'

const UserProfileContent = () => {
  const { user, loading, targetUserId, isOwnProfile, updateUser } = useProfile()
  const [isEditing, setIsEditing] = useState(false)

  if (loading) {
    return (
      <div className="profile-page">
        <ProfileSkeleton />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <ErrorMessage 
            title="Профіль не знайдено"
            message="Не вдалося завантажити дані профілю. Спробуйте пізніше."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <ProfileHeader 
          user={user} 
          isOwnProfile={isOwnProfile} 
          onUserUpdate={updateUser}
          onEditingStateChange={setIsEditing}
        />
        
        {!isEditing && (
          <div className="profile-main-content">
            <div className="profile-center-column">
              <Wall userId={targetUserId} isOwnProfile={isOwnProfile} posts={user?.posts || []} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const UserProfile = () => {
  const { userId } = useParams()
  const { user: currentUser, isAuthenticated, isLoading } = useAuthStore()
  const targetUserId = userId || currentUser?.id

  if (isLoading) {
    return <div className="loading-screen">Завантаження...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!targetUserId) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="error-message">
            <h3>Помилка</h3>
            <p>Не вдалося визначити користувача</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Header />
      <ProfileProvider userId={targetUserId}>
        <UserProfileContent />
      </ProfileProvider>
    </ErrorBoundary>
  )
}

export default UserProfile