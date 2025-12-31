import { useState, useEffect, useCallback } from 'react'
import { messagesService } from '../services/messagesService'

export const useConversations = () => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true)
      const result = await messagesService.getConversations()
      
      if (result.success) {
        setConversations(result.data || [])
        setError(null)
      } else {
        setError(result.error)
        setConversations([])
      }
    } catch (err) {
      setError('Помилка завантаження розмов')
      setConversations([])
    } finally {
      setLoading(false)
    }
  }, [])

  const updateConversation = useCallback((conversationId, updates) => {
    setConversations(prev => 
      prev.map(conv => 
        conv._id === conversationId 
          ? { ...conv, ...updates }
          : conv
      )
    )
  }, [])

  const addConversation = useCallback((conversation) => {
    setConversations(prev => {
      const exists = prev.find(conv => conv._id === conversation._id)
      if (exists) return prev
      return [conversation, ...prev]
    })
  }, [])

  const removeConversation = useCallback((conversationId) => {
    setConversations(prev => prev.filter(conv => conv._id !== conversationId))
  }, [])

  const markAsRead = useCallback((conversationId) => {
    updateConversation(conversationId, { unreadCount: 0 })
  }, [updateConversation])

  const incrementUnread = useCallback((conversationId) => {
    setConversations(prev => 
      prev.map(conv => 
        conv._id === conversationId 
          ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
          : conv
      )
    )
  }, [])

  const createOrFindConversation = useCallback(async (userId) => {
    try {
      const result = await messagesService.createOrFindConversation(userId)
      
      if (result.success) {
        const conversation = result.data
        addConversation(conversation)
        return conversation
      }
      return null
    } catch (err) {
      console.error('Помилка створення розмови:', err)
      return null
    }
  }, [addConversation])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  return {
    conversations,
    loading,
    error,
    loadConversations,
    updateConversation,
    addConversation,
    removeConversation,
    markAsRead,
    incrementUnread,
    createOrFindConversation
  }
}