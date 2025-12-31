import { useState, useEffect, useCallback } from 'react'
import { friendsService } from '../features/friends/services/friendsService'

export const useUserSearch = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [randomUsers, setRandomUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchUsers = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setResults([])
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await friendsService.searchUsers(searchQuery)
      setResults(result.success ? result.data || [] : [])
    } catch (err) {
      setError('Помилка пошуку')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const loadRandomUsers = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await friendsService.searchUsers('', { random: true, limit: 100 })
      setRandomUsers(result.success ? result.data || [] : [])
    } catch (err) {
      setError('Помилка завантаження користувачів')
      setRandomUsers([])
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useCallback(
    (searchQuery) => {
      const timeoutId = setTimeout(() => {
        searchUsers(searchQuery)
      }, 300)
      return () => clearTimeout(timeoutId)
    },
    []
  )

  useEffect(() => {
    const cleanup = debouncedSearch(query)
    return cleanup
  }, [query, debouncedSearch])

  const sendFriendRequest = async (userId) => {
    try {
      const result = await friendsService.sendFriendRequest(userId)
      if (result.success || result.status === 'success') {
        // Update user status in both arrays
        const updateUser = (user) => 
          user.id === userId ? { ...user, relationshipStatus: 'following', requestSent: true } : user
        
        setResults(prev => prev.map(updateUser))
        setRandomUsers(prev => prev.map(updateUser))
        return true
      }
      return false
    } catch (err) {
      setError('Помилка відправки заявки')
      return false
    }
  }

  const cancelFriendRequest = async (userId) => {
    try {
      const result = await friendsService.cancelFriendRequest(userId)
      if (result.success || result.status === 'success') {
        // Update user status in both arrays
        const updateUser = (user) => 
          user.id === userId ? { ...user, relationshipStatus: 'none', requestSent: false } : user
        
        setResults(prev => prev.map(updateUser))
        setRandomUsers(prev => prev.map(updateUser))
        return true
      }
      return false
    } catch (err) {
      setError('Помилка скасування заявки')
      return false
    }
  }

  return {
    query,
    setQuery,
    results,
    randomUsers,
    loading,
    error,
    loadRandomUsers,
    sendFriendRequest,
    cancelFriendRequest
  }
}