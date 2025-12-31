import React, { useState, useEffect, useCallback } from 'react'
import ChatHeader from './ChatHeader'
import MessagesList from './MessagesList'
import MessageInput from './MessageInput'
import { messagesService } from '../services/messagesService'
import { useTyping } from '../hooks/useTyping'
import { EmptyState } from '../../../components/ui/EmptyState'

const ChatArea = ({ 
  conversation, 
  currentUser, 
  onTyping, 
  onConversationUpdate 
}) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const { isTyping, handleUserTyping } = useTyping()

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return
    
    try {
      setLoading(true)
      const result = await messagesService.getMessages(conversationId)
      if (result.success) {
        setMessages(result.data || [])
      }
    } catch (error) {
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (conversation?._id) {
      loadMessages(conversation._id)
    } else {
      setMessages([])
    }
  }, [conversation?._id, loadMessages])

  const handleSendMessage = useCallback(async (content, file) => {
    if (!conversation?._id || (!content.trim() && !file)) return

    try {
      let message
      if (file) {
        message = await messagesService.sendFileMessage(conversation._id, file, content.trim())
      } else {
        message = await messagesService.sendMessage(conversation._id, content.trim())
      }
      
      setMessages(prev => [...prev, message])
      onConversationUpdate({
        lastMessage: message,
        lastActivity: new Date()
      })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }, [conversation?._id, onConversationUpdate])

  const handleDeleteMessage = useCallback(async (messageId) => {
    try {
      await messagesService.deleteMessage(messageId)
      setMessages(prev => prev.filter(msg => msg._id !== messageId))
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }, [])

  if (!conversation) {
    return (
      <div className="chat-area">
        <div className="chat-header">
          <EmptyState 
            title="Оберіть розмову"
            description="Виберіть розмову зі списку або створіть нову"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="chat-area">
      <ChatHeader 
        conversation={conversation}
        isTyping={isTyping}
      />

      <MessagesList
        messages={messages}
        currentUser={currentUser}
        loading={loading}
        onDeleteMessage={handleDeleteMessage}
      />

      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={onTyping}
      />
    </div>
  )
}

export default ChatArea