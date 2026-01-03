import { useState, useCallback, useEffect } from 'react'
import { followsService } from '../services/followsService'

export const useFollowToggle = (user, onUserUpdate) => {
  const [isFollowing, setIsFollowing] = useState(user?.isFollowing || false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user?.isFollowing !== undefined) {
      setIsFollowing(user.isFollowing)
    }
  }, [user?.isFollowing])

  const toggleFollow = useCallback(async () => {
    if (isLoading || !user?.id) return

    setIsLoading(true)
    try {
      const result = isFollowing
        ? await followsService.unfollowUser(user.id)
        : await followsService.followUser(user.id)

      if (result.success) {
        const newFollowingState = !isFollowing
        setIsFollowing(newFollowingState)

        if (onUserUpdate) {
          const followersChange = newFollowingState ? 1 : -1
          onUserUpdate({
            ...user,
            followersCount: Math.max(0, (user.followersCount || 0) + followersChange)
          })
        }
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isFollowing, isLoading, user, onUserUpdate])

  return {
    isFollowing,
    isLoading,
    toggleFollow
  }
}
