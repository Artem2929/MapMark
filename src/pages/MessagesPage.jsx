import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { messagesService } from '../features/messages/services/messagesService'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import './MessagesPage.css'

const Messages = () => {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const initializeMessages = async () => {
      setLoading(true)
      
      const authToken = localStorage.getItem('accessToken')
      if (!authToken) {
        navigate('/login')
        return
      }

      await loadConversations()
      setLoading(false)
    }

    initializeMessages()
  }, [navigate])

  const loadConversations = async () => {
    const result = await messagesService.getConversations()
    if (result.success) {
      setConversations(result.data || [])
    } else {
      setError(result.error)
      setConversations([])
    }
  }

  const handleConversationClick = (conversationId) => {
    navigate(`/messages/${conversationId}`)
  }

  if (loading) {
    return (
      <div className="messages-page">
        <div className="loading">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="messages-page">
      <div className="messages-container">
        <Breadcrumbs 
          items={[
            { label: 'Профіль', href: '/profile' },
            { label: 'Повідомлення' }
          ]}
        />

        <div className="messages-header">
          <h1>Мої повідомлення</h1>
        </div>

        <div className="messages-content">
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {conversations.length > 0 ? (
            <div className="conversations-list">
              {conversations.map(conversation => (
                <div 
                  key={conversation.id} 
                  className="conversation-card"
                  onClick={() => handleConversationClick(conversation.id)}
                >
                  <div className="conversation-avatar">
                    {conversation.avatar ? (
                      <img 
                        src={conversation.avatar.startsWith('http') ? conversation.avatar : `http://localhost:3001${conversation.avatar}`} 
                        alt="Conversation avatar" 
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {conversation.name ? conversation.name.charAt(0) : 'C'}
                      </div>
                    )}
                    {conversation.isOnline && (
                      <div className="online-status online"></div>
                    )}
                  </div>
                  <div className="conversation-info">
                    <h3 className="conversation-name">
                      {conversation.name || 'Розмова'}
                    </h3>
                    <p className="conversation-last-message">
                      {conversation.lastMessage?.content || 'Немає повідомлень'}
                    </p>
                  </div>
                  <div className="conversation-meta">
                    <span className="conversation-time">
                      {conversation.lastActivity ? new Date(conversation.lastActivity).toLocaleDateString() : ''}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="unread-count">{conversation.unreadCount}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>У вас поки немає повідомлень</p>
              <p>Почніть спілкування з друзями!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages