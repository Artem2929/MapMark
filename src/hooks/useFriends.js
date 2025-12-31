import { useState, useEffect } from 'react'
import { friendsService } from '../features/friends/services/friendsService'

export const useFriends = (userId) => {
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadFriends = async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const result = await friendsService.getFriends(userId)
      setFriends(result.success ? result.data || [] : [])
    } catch (err) {
      setError('Помилка завантаження друзів')
    } finally {
      setLoading(false)
    }
  }

  const removeFriend = async (friendId) => {
    try {
      const result = await friendsService.removeFriend(friendId)
      if (result.success || result.status === 'success') {
        setFriends(prev => prev.filter(friend => friend.id !== friendId))
        return true
      } else {
        setError('Помилка видалення друга')
        return false
      }
    } catch (err) {
      setError('Помилка видалення друга')
      return false
    }
  }

  useEffect(() => {
    loadFriends()
  }, [userId])

  return {
    friends,
    loading,
    error,
    removeFriend,
    reloadFriends: loadFriends,
    setFriends
  }
}