import { useParams, Navigate } from 'react-router-dom'
import { useAuthStore } from '../app/store'
import { Header, ErrorMessage } from '../components/ui'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ProfileProvider, useProfile } from '../contexts/ProfileContext'
import ProfileContent from '../features/profile/components/ProfileContent'
import ProfileSkeleton from '../features/profile/components/ProfileSkeleton'
import ProfileBreadcrumbs from '../features/profile/components/ProfileBreadcrumbs'
import Wall from '../features/profile/components/Wall'
import '../features/profile/components/Profile.css'

const UserProfileContent = () => {
  const { user, loading, targetUserId, isOwnProfile } = useProfile()

  if (loading) {
    return (
      <div className="profile-user-profile">
        <ProfileSkeleton />
      </div>
    )
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
    )
  }

  return (
    <div className="page-container profile-user-profile">
      <div className="profile-profile-container">
        <ProfileBreadcrumbs />
        <ProfileContent />
        <Wall userId={targetUserId} isOwnProfile={isOwnProfile} posts={user?.posts || []} />
      </div>
    </div>
  )
}

const UserProfile = () => {
  const { userId } = useParams()
  const { user: currentUser, isAuthenticated, isLoading } = useAuthStore()
  const targetUserId = userId || currentUser?.id

  if (isLoading) {
    return <div>Завантаження...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
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