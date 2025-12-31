import { useEffect, useRef } from 'react'
import { messagesService } from '../services/messagesService'

export const useMessagesSocket = ({ 
  activeChat, 
  currentUserId, 
  onNewMessage, 
  onUserOnline, 
  onUserOffline 
}) => {
  const socketRef = useRef(null)

  useEffect(() => {
    // Ініціалізуємо WebSocket підключення
    socketRef.current = messagesService.initSocket()

    if (socketRef.current) {
      // Підписуємося на нові повідомлення
      messagesService.onNewMessage((data) => {
        if (onNewMessage) {
          onNewMessage(data.message)
        }
      })

      // Підписуємося на онлайн статуси
      messagesService.onUserOnline((data) => {
        if (onUserOnline) {
          onUserOnline(data.userId)
        }
      })

      messagesService.onUserOffline((data) => {
        if (onUserOffline) {
          onUserOffline(data.userId)
        }
      })
    }

    return () => {
      if (socketRef.current) {
        messagesService.disconnect()
      }
    }
  }, [onNewMessage, onUserOnline, onUserOffline])

  useEffect(() => {
    // Приєднуємося до кімнати активного чату
    if (activeChat && socketRef.current) {
      messagesService.joinConversation(activeChat)
    }

    return () => {
      if (activeChat && socketRef.current) {
        messagesService.leaveConversation(activeChat)
      }
    }
  }, [activeChat])

  const sendTyping = (conversationId, isTyping) => {
    if (socketRef.current) {
      messagesService.sendTyping(conversationId, isTyping)
    }
  }

  return {
    sendTyping,
    isConnected: socketRef.current?.connected || false
  }
}