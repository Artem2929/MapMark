import { useState, useCallback, useRef } from 'react'

export const useTyping = (sendTypingCallback) => {
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState(new Set())
  const typingTimeoutRef = useRef(null)

  const startTyping = useCallback(() => {
    if (sendTypingCallback) {
      sendTypingCallback(true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (sendTypingCallback) {
        sendTypingCallback(false)
      }
    }, 1000)
  }, [sendTypingCallback])

  const handleUserTyping = useCallback((userId, typing) => {
    setTypingUsers(prev => {
      const newSet = new Set(prev)
      if (typing) {
        newSet.add(userId)
      } else {
        newSet.delete(userId)
      }
      return newSet
    })

    setIsTyping(typing)
    
    if (typing) {
      setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(userId)
          return newSet
        })
        setIsTyping(false)
      }, 3000)
    }
  }, [])

  return {
    isTyping,
    typingUsers,
    startTyping,
    handleUserTyping
  }
}