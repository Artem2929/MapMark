import { useEffect, useCallback, useRef } from 'react'
import { messagesService } from '../services/messagesService'

export const useMessagesSocket = ({ 
  activeChat, 
  currentUserId, 
  onNewMessage, 
  onMessageDeleted, 
  onUserTyping, 
  onUserOnline, 
  onUserOffline 
}) => {
  const socketRef = useRef(null)

  const handleNewMessage = useCallback((message) => {
    onNewMessage?.(message)
  }, [onNewMessage])

  const handleMessageDeleted = useCallback(({ messageId }) => {
    onMessageDeleted?.(messageId)
  }, [onMessageDeleted])

  const handleUserTyping = useCallback(({ userId, isTyping }) => {
    onUserTyping?.(userId, isTyping)
  }, [onUserTyping])

  const handleUserOnline = useCallback(({ userId }) => {
    onUserOnline?.(userId)
  }, [onUserOnline])

  const handleUserOffline = useCallback(({ userId }) => {
    onUserOffline?.(userId)
  }, [onUserOffline])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    messagesService.setToken(token)
    socketRef.current = messagesService.initSocket()

    messagesService.onNewMessage(handleNewMessage)
    messagesService.onMessageDeleted(handleMessageDeleted)
    messagesService.onUserTyping(handleUserTyping)
    messagesService.onUserOnline(handleUserOnline)
    messagesService.onUserOffline(handleUserOffline)

    return () => {
      messagesService.off('newMessage', handleNewMessage)
      messagesService.off('messageDeleted', handleMessageDeleted)
      messagesService.off('userTyping', handleUserTyping)
      messagesService.off('userOnline', handleUserOnline)
      messagesService.off('userOffline', handleUserOffline)
      messagesService.disconnect()
    }
  }, [handleNewMessage, handleMessageDeleted, handleUserTyping, handleUserOnline, handleUserOffline])

  useEffect(() => {
    if (activeChat) {
      messagesService.joinConversation(activeChat)
      messagesService.markAsRead(activeChat)

      return () => {
        messagesService.leaveConversation(activeChat)
      }
    }
  }, [activeChat])

  const sendTyping = useCallback((isTyping) => {
    if (activeChat) {
      messagesService.sendTyping(activeChat, isTyping)
    }
  }, [activeChat])

  return { sendTyping }
}