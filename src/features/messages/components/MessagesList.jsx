import React, { memo, useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import { Loading } from '../../../components/ui/Loading'

const MessagesList = memo(({ 
  messages, 
  currentUser, 
  loading, 
  onDeleteMessage 
}) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'end' 
    })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (loading) {
    return (
      <div className="messages-area">
        <Loading />
      </div>
    )
  }

  return (
    <div className="messages-area">
      {messages.map((message) => (
        <MessageBubble
          key={message._id}
          message={message}
          isOwn={message.sender._id === currentUser?.id}
          onDelete={() => onDeleteMessage(message._id)}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
})

MessagesList.displayName = 'MessagesList'

export default MessagesList