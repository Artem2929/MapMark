import { useState, useCallback, useRef } from 'react'

export const useMessageInput = (onSend, onTyping) => {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [attachedFile, setAttachedFile] = useState(null)
  const textareaRef = useRef(null)

  const handleChange = useCallback((value) => {
    setMessage(value)
    onTyping?.()
  }, [onTyping])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleSend = useCallback(async () => {
    const trimmedMessage = message.trim()
    
    if (!trimmedMessage && !attachedFile) return
    if (isSending) return

    try {
      setIsSending(true)
      await onSend(trimmedMessage, attachedFile)
      
      setMessage('')
      setAttachedFile(null)
      
      // Focus back to textarea
      textareaRef.current?.focus()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }, [message, attachedFile, isSending, onSend])

  const handleFileAttach = useCallback((file) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('Файл занадто великий. Максимальний розмір: 10MB')
      return
    }
    setAttachedFile(file)
  }, [])

  const removeFile = useCallback(() => {
    setAttachedFile(null)
  }, [])

  const canSend = (message.trim() || attachedFile) && !isSending

  return {
    message,
    isSending,
    attachedFile,
    canSend,
    textareaRef,
    handleChange,
    handleKeyDown,
    handleSend,
    handleFileAttach,
    removeFile
  }
}