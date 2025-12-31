import { useState, useEffect } from 'react'
import { friendsService } from '../features/friends/services/friendsService'

export const useFriendRequests = (userId) => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadRequests = async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const result = await friendsService.getFriendRequests(userId)
      setRequests(result.success ? result.data || [] : [])
    } catch (err) {
      setError('Помилка завантаження заявок')
    } finally {
      setLoading(false)
    }
  }

  const acceptRequest = async (requestId) => {
    try {
      const result = await friendsService.acceptFriendRequest(requestId)
      if (result.success || result.status === 'success') {
        setRequests(prev => prev.filter(request => request.id !== requestId))
        return true
      } else {
        setError('Помилка прийняття заявки')
        return false
      }
    } catch (err) {
      setError('Помилка прийняття заявки')
      return false
    }
  }

  const rejectRequest = async (requestId) => {
    try {
      const result = await friendsService.rejectFriendRequest(requestId)
      if (result.success || result.status === 'success') {
        setRequests(prev => prev.filter(request => request.id !== requestId))
        return true
      } else {
        setError('Помилка відхилення заявки')
        return false
      }
    } catch (err) {
      setError('Помилка відхилення заявки')
      return false
    }
  }

  useEffect(() => {
    loadRequests()
  }, [userId])

  return {
    requests,
    loading,
    error,
    acceptRequest,
    rejectRequest,
    reloadRequests: loadRequests,
    setRequests
  }
}