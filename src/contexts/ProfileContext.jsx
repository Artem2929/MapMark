import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '../app/store'
import { profileService } from '../features/profile/services/profileService'

const ProfileContext = createContext()

// Простий кеш для профілів
const profileCache = new Map()

export const ProfileProvider = ({ children, userId }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user: currentUser } = useAuthStore()
  const fetchingRef = useRef(false)
  
  const isOwnProfile = currentUser?.id === userId
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError('Не вказано ID користувача')
        setLoading(false)
        return
      }

      // Перевіряємо чи вже виконується запит
      if (fetchingRef.current) {
        return
      }

      // Перевіряємо кеш
      const cacheKey = `${userId}-${currentUser?.id || 'anonymous'}`
      if (profileCache.has(cacheKey)) {
        const cachedData = profileCache.get(cacheKey)
        setUser(cachedData)
        setLoading(false)
        return
      }

      try {
        fetchingRef.current = true
        setLoading(true)
        setError(null)
        
        // Додаємо мінімальну затримку для показу skeleton
        await new Promise(resolve => setTimeout(resolve, 200))
        
        const profileData = await profileService.getUserProfile(userId)
        const userData = profileData.data?.user || profileData
        
        // Зберігаємо в кеш
        profileCache.set(cacheKey, userData)
        setUser(userData)
      } catch (err) {
        console.error('Profile fetch error:', err)
        setError(err.message || 'Помилка завантаження профілю')
      } finally {
        setLoading(false)
        fetchingRef.current = false
      }
    }

    // Перевіряємо чи є всі необхідні дані перед викликом
    if (userId) {
      fetchProfile()
    }
  }, [userId, currentUser?.id]) // Додали currentUser?.id для правильного кешування

  const updateUser = useCallback((updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData }
    setUser(newUserData)
    
    // Оновлюємо кеш
    const cacheKey = `${userId}-${currentUser?.id || 'anonymous'}`
    profileCache.set(cacheKey, newUserData)
  }, [user, userId, currentUser?.id])

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