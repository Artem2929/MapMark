import React, { useMemo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../../app/store'
import { useConversations } from '../hooks/useConversations'
import { useActiveChat } from '../hooks/useActiveChat'
import { useMessagesSocket } from '../hooks/useMessagesSocket'
import { useTyping } from '../hooks/useTyping'
import ConversationsSidebar from './ConversationsSidebar'
import ChatArea from './ChatArea'
import NewChatModal from './NewChatModal'
import './MessagesPage.css'

const MessagesPage = () => {
  const navigate = useNavigate()
  const { userId } = useParams()
  const { user: currentUser, isAuthenticated, isLoading } = useAuthStore()
  const { activeChat, selectChat, clearChat } = useActiveChat()
  const [showNewChatModal, setShowNewChatModal] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  const {
    conversations,
    loading,
    error,
    updateConversation,
    addConversation,
    removeConversation,
    markAsRead,
    incrementUnread,
    createOrFindConversation
  } = useConversations()

  // Перевірка автентифікації
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isLoading, isAuthenticated, navigate])

  // Автоматично відкриваємо чат з користувачем, якщо передано userId
  useEffect(() => {
    if (userId && currentUser && !loading && userId !== currentUser.id) {
      const existingConversation = conversations.find(conv => 
        conv.participant?.id === userId || conv.participant?._id === userId
      )
      
      if (existingConversation) {
        selectChat(existingConversation._id)
        markAsRead(existingConversation._id)
      } else {
        createOrFindConversation(userId).then(conversation => {
          if (conversation) {
            selectChat(conversation._id)
          }
        })
      }
    }
  }, [userId, currentUser, conversations, loading, selectChat, markAsRead, createOrFindConversation])

  const { sendTyping } = useMessagesSocket({
    activeChat,
    currentUserId: currentUser?.id,
    onNewMessage: (message) => {
      if (message.conversation !== activeChat) {
        incrementUnread(message.conversation)
      }
      updateConversation(message.conversation, {
        lastMessage: message,
        lastActivity: new Date()
      })
    },
    onUserOnline: (userId) => {
      conversations.forEach(conv => {
        if (conv.participant?._id === userId) {
          updateConversation(conv._id, {
            participant: { ...conv.participant, isOnline: true }
          })
        }
      })
    },
    onUserOffline: (userId) => {
      conversations.forEach(conv => {
        if (conv.participant?._id === userId) {
          updateConversation(conv._id, {
            participant: { ...conv.participant, isOnline: false }
          })
        }
      })
    }
  })

  const { startTyping } = useTyping(sendTyping)

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    
    const query = searchQuery.toLowerCase()
    return conversations.filter(conv => {
      const participant = conv.participant
      return (
        participant?.username?.toLowerCase().includes(query) ||
        participant?.firstName?.toLowerCase().includes(query) ||
        participant?.lastName?.toLowerCase().includes(query) ||
        participant?.email?.toLowerCase().includes(query) ||
        `${participant?.firstName || ''} ${participant?.lastName || ''}`.toLowerCase().includes(query)
      )
    })
  }, [conversations, searchQuery])

  const activeConversation = useMemo(() => 
    conversations.find(conv => conv._id === activeChat),
    [conversations, activeChat]
  )

  const handleConversationSelect = (conversationId) => {
    selectChat(conversationId)
    markAsRead(conversationId)
  }

  const handleConversationDelete = async (conversationId) => {
    removeConversation(conversationId)
    if (activeChat === conversationId) {
      clearChat()
    }
  }

  const handleNewChat = (conversation) => {
    addConversation(conversation)
    selectChat(conversation._id)
    setShowNewChatModal(false)
  }

  const handleCreateChatFromSearch = async (userId) => {
    try {
      const conversation = await createOrFindConversation(userId)
      if (conversation) {
        selectChat(conversation._id)
      }
    } catch (error) {
      console.error('Помилка створення чату:', error)
    }
  }

  if (isLoading) {
    return null
  }

  if (!isAuthenticated || !currentUser) {
    return null
  }

  return (
    <div className="messages-page">
      <div className="messages-container">
        <div className="messages-header">
          <h1>Повідомлення</h1>
        </div>

        <div className="messages-layout">
          <ConversationsSidebar
            conversations={filteredConversations}
            activeChat={activeChat}
            loading={loading}
            error={error}
            onConversationSelect={handleConversationSelect}
            onConversationDelete={handleConversationDelete}
            onSearchChange={setSearchQuery}
            onNewChatClick={() => setShowNewChatModal(true)}
            onCreateChat={handleCreateChatFromSearch}
            userId={currentUser?.id}
          />

          <ChatArea
            conversation={activeConversation}
            currentUser={currentUser}
            onTyping={startTyping}
            onConversationUpdate={(updates) => 
              activeChat && updateConversation(activeChat, updates)
            }
          />
        </div>

        {showNewChatModal && (
          <NewChatModal
            onClose={() => setShowNewChatModal(false)}
            onChatCreated={handleNewChat}
          />
        )}
      </div>
    </div>
  )
}

export default MessagesPage