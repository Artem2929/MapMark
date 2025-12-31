import { useState, useCallback } from 'react'

export const useActiveChat = () => {
  const [activeChat, setActiveChat] = useState(null)

  const selectChat = useCallback((chatId) => {
    setActiveChat(chatId)
  }, [])

  const clearChat = useCallback(() => {
    setActiveChat(null)
  }, [])

  return {
    activeChat,
    selectChat,
    clearChat
  }
}