import React, { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useConversations } from '../hooks/useConversations'
import { useActiveChat } from '../hooks/useActiveChat'
import { useMessagesSocket } from '../hooks/useMessagesSocket'
import { useTyping } from '../hooks/useTyping'
import ConversationsSidebar from './ConversationsSidebar'
import ChatArea from './ChatArea'
import NewChatModal from './NewChatModal'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import './MessagesPage.css'

const MessagesPage = () => {
  const navigate = useNavigate()
  const { userId } = useParams()
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
    incrementUnread
  } = useConversations()

  const currentUser = useMemo(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return null
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return { id: payload.id }
    } catch {
      return null
    }
  }, [])

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

  if (!currentUser) {
    navigate('/login')
    return null
  }

  return (
    <div className="messages-page">
      <div className="messages-container">
        <Breadcrumbs 
          items={[
            { label: 'Профіль', href: `/profile/${userId}` },
            { label: 'Повідомлення' }
          ]}
        />

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