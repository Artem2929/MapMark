import React, { useMemo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../../app/store'
import { useConversations } from '../hooks/useConversations'
import { useActiveChat } from '../hooks/useActiveChat'
import ConversationsSidebar from './ConversationsSidebar'
import ChatArea from './ChatArea'
import './MessagesPage.css'

const MessagesPage = () => {
  const navigate = useNavigate()
  const { userId } = useParams()
  const { user: currentUser, isAuthenticated } = useAuthStore()
  const { activeChat, selectChat, clearChat } = useActiveChat()
  const [searchQuery, setSearchQuery] = React.useState('')

  const {
    conversations,
    loading,
    error,
    updateConversation,
    addConversation,
    removeConversation,
    markAsRead,
    createOrFindConversation
  } = useConversations()

  // Перевірка автентифікації
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Автоматично відкриваємо чат з користувачем, якщо передано userId
  useEffect(() => {
    if (userId && currentUser && !loading) {
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
            onCreateChat={handleCreateChatFromSearch}
          />

          <ChatArea
            conversation={activeConversation}
            currentUser={currentUser}
            onConversationUpdate={(updates) => 
              activeChat && updateConversation(activeChat, updates)
            }
          />
        </div>
      </div>
    </div>
  )
}

export default MessagesPage