import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../app/store'
import { profileService } from '../features/profile/services/profileService'

const ProfileContext = createContext()

export const ProfileProvider = ({ children, userId }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user: currentUser } = useAuthStore()
  
  const isOwnProfile = currentUser?.id === userId
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError('Не вказано ID користувача')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Додаємо мінімальну затримку для показу skeleton
        await new Promise(resolve => setTimeout(resolve, 200))
        
        const profileData = await profileService.getUserProfile(userId)
        setUser(profileData.data?.user || profileData)
      } catch (err) {
        console.error('Profile fetch error:', err)
        setError(err.message || 'Помилка завантаження профілю')
      } finally {
        setLoading(false)
      }
    }

    // Перевіряємо чи є всі необхідні дані перед викликом
    if (userId) {
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