import React, { useState, useEffect } from 'react'
import { messagesService } from '../services/messagesService'

const NewChatModal = ({ onClose, onChatCreated }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setLoading(true)
      messagesService.searchUsers(searchQuery)
        .then(results => {
          setSearchResults(results)
        })
        .catch(error => {
          console.error('Помилка пошуку:', error)
          setSearchResults([])
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const handleCreateChat = async (userId) => {
    try {
      const result = await messagesService.createConversation(userId)
      if (result.success) {
        onChatCreated(result.data)
      }
    } catch (error) {
      console.error('Помилка створення чату:', error)
    }
  }

  return (
    <div className="new-chat-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Новий чат</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <p>Знайдіть друга для початку розмови</p>
          
          <div className="modal-search">
            <input
              type="text"
              className="modal-search-input"
              placeholder="Введіть ім'я або username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="followers-list">
            {loading ? (
              <div className="follower-item loading">
                Пошук...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map(user => (
                <div 
                  key={user.id || user._id}
                  className="follower-item"
                  onClick={() => handleCreateChat(user.id || user._id)}
                >
                  <div className="follower-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      user.name?.charAt(0) || user.firstName?.charAt(0) || '?'
                    )}
                  </div>
                  <div className="follower-info">
                    <div className="follower-name">
                      {user.name || `${user.firstName} ${user.lastName}`}
                    </div>
                    {user.username && (
                      <div className="follower-email">@{user.username}</div>
                    )}
                  </div>
                </div>
              ))
            ) : searchQuery.trim().length >= 2 ? (
              <div className="follower-item empty">
                Користувачів не знайдено
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewChatModal