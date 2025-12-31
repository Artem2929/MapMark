import { useCallback, useRef } from 'react'

export const useTyping = (sendTyping) => {
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)

  const startTyping = useCallback((conversationId) => {
    if (!isTypingRef.current && sendTyping) {
      sendTyping(conversationId, true)
      isTypingRef.current = true
    }

    // Очищуємо попередній таймер
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Встановлюємо новий таймер для зупинки індикатора
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current && sendTyping) {
        sendTyping(conversationId, false)
        isTypingRef.current = false
      }
    }, 3000) // Зупиняємо через 3 секунди бездіяльності
  }, [sendTyping])

  const stopTyping = useCallback((conversationId) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (isTypingRef.current && sendTyping) {
      sendTyping(conversationId, false)
      isTypingRef.current = false
    }
  }, [sendTyping])

  return {
    startTyping,
    stopTyping
  }
}