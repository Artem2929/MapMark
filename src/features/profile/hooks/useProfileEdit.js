import { useState, useCallback } from 'react'
import { updateProfile } from '../services/profileService'

export const useProfileEdit = (user) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const saveProfile = useCallback(async (profileData) => {
    if (!user?.id) {
      throw new Error('Користувач не знайдений')
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await updateProfile(user.id, profileData)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    saveProfile,
    isLoading,
    error,
    clearError
  }
}