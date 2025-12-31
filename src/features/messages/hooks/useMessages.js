import { useState, useEffect, useCallback } from 'react'
import { messagesService } from '../services/messagesService'

export const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await messagesService.getMessages(conversationId)
      
      if (result.success) {
        setMessages(result.data || [])
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Помилка завантаження повідомлень')
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, message])
  }, [])

  const removeMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg._id !== messageId))
  }, [])

  const updateMessage = useCallback((messageId, updates) => {
    setMessages(prev => prev.map(msg => 
      msg._id === messageId ? { ...msg, ...updates } : msg
    ))
  }, [])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  return {
    messages,
    loading,
    error,
    addMessage,
    removeMessage,
    updateMessage,
    refetch: loadMessages
  }
}