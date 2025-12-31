import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { messagesService } from '../services/messagesService'
import { friendsService } from '../../friends/services/friendsService'
import { Loading } from '../../../components/ui/Loading'
import { EmptyState } from '../../../components/ui/EmptyState'

const NewChatModal = ({ onClose, onChatCreated }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)

  const searchUsers = useCallback(async (query) => {
    if (query.trim().length < 3) {
      setSearchResults([])
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      let users = []
      
      try {
        users = await messagesService.searchUsers(query)
      } catch {
        const friendsResult = await friendsService.searchUsers(query)
        if (friendsResult.success) {
          users = friendsResult.data
        }
      }

      const formattedUsers = users.map(user => ({
        _id: user._id || user.id,
        username: user.name || user.username || 
          (user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.firstName || user.lastName || 'Unknown'),
        email: user.email || '',
        avatar: user.avatar,
        isOnline: user.isOnline || user.status === 'online'
      }))

      setSearchResults(formattedUsers)
    } catch (error) {
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchUsers])

  const handleStartChat = useCallback(async (user) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert('Ви не авторизовані. Будь ласка, увійдіть в систему.')
        return
      }

      messagesService.setToken(token)
      const conversation = await messagesService.createConversation(user._id)
      
      onChatCreated(conversation)
    } catch (error) {
      alert('Помилка при створенні чату: ' + error.message)
    }
  }, [onChatCreated])

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const modalContent = (
    <div className="new-chat-modal" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Новий чат</h3>
          <button 
            className="modal-close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <p>Знайдіть користувача для початку розмови:</p>
          
          <div className="modal-search">
            <input
              type="text"
              placeholder="Пошук користувачів..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="modal-search-input"
              autoFocus
            />
          </div>
          
          <div className="followers-list">
            {loading ? (
              <Loading />
            ) : searchResults.length > 0 ? (
              searchResults.map(user => (
                <div 
                  key={user._id} 
                  className="follower-item"
                  onClick={() => handleStartChat(user)}
                >
                  <div className="follower-avatar">
                    {user.avatar ? (
                      <img 
                        src={user.avatar.startsWith('http') 
                          ? user.avatar 
                          : `http://localhost:3001${user.avatar}`} 
                        alt={user.username}
                        loading="lazy"
                      />
                    ) : (
                      user.username?.charAt(0)?.toUpperCase() || '?'
                    )}
                    {user.isOnline && <div className="online-dot" />}
                  </div>
                  <div className="follower-info">
                    <div className="follower-name">{user.username}</div>
                    {user.email && (
                      <div className="follower-email">{user.email}</div>
                    )}
                  </div>
                </div>
              ))
            ) : searchQuery && !loading ? (
              <EmptyState 
                title="Нічого не знайдено"
                description="Спробуйте інший запит"
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default NewChatModal