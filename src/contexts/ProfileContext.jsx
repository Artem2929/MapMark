import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../app/store'
import { getUserProfile } from '../features/profile/services/profileService'

const ProfileContext = createContext()

export const ProfileProvider = ({ children, userId }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user: currentUser } = useAuthStore()
  
  const isOwnProfile = currentUser?.id === userId
  
  useEffect(() => {
    const fetchProfile = async () => {
      // Використовуємо currentUser.id якщо userId невалідний або відсутній
      const validUserId = userId && userId.match(/^[0-9a-fA-F]{24}$/) ? userId : currentUser?.id
      
      if (!validUserId) {
        setError('Не вказано ID користувача')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const profileData = await getUserProfile(validUserId)
        setUser(profileData.data?.user || profileData)
      } catch (err) {
        console.error('Profile fetch error:', err)
        setError(err.message || 'Помилка завантаження профілю')
        
        // Fallback to mock data for development or when user not found
        if (process.env.NODE_ENV === 'development' || import.meta.env.DEV || err.message === 'Користувача не знайдено') {
          setUser({
            id: validUserId || currentUser?.id || 'unknown',
            name: 'Артем Поліщук',
            email: 'artem@example.com',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            bio: 'Розробник з Києва. Люблю подорожувати та фотографувати.',
            location: 'Київ, Україна',
            website: 'https://artempolishchuk.dev',
            joinDate: '2020-03-15',
            followersCount: 1247,
            followingCount: 892,
            postsCount: 156,
            photos: [
              { id: 1, url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop', title: 'Захід сонця' },
              { id: 2, url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop', title: 'Природа' },
              { id: 3, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop', title: 'Ліс' }
            ],
            friends: [
              { id: 1, name: 'Олена Коваленко', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face' },
              { id: 2, name: 'Максим Петренко', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face' }
            ],
            posts: [
              {
                id: 1,
                content: 'Чудовий день для прогулянки парком!',
                createdAt: '2024-01-15T10:30:00Z',
                author: { name: 'Артем Поліщук', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
                likes: 23, comments: 5, shares: 2
              }
            ]
          })
          setError(null)
        }
      } finally {
        setLoading(false)
      }
    }

    // Перевіряємо чи є всі необхідні дані перед викликом
    if (userId || currentUser?.id) {
      fetchProfile()
    }
  }, [userId]) // Видалили currentUser?.id з залежностей

  const updateUser = useCallback((updatedUserData) => {
    setUser(prev => ({ ...prev, ...updatedUserData }))
  }, [])

  return (
    <ProfileContext.Provider value={{
      user,
      loading,
      error,
      isOwnProfile,
      targetUserId: userId,
      updateUser
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider')
  }
  return context
}