import React, { memo } from 'react'
import ConversationItem from './ConversationItem'
import SearchInput from './SearchInput'
import NewChatButton from './NewChatButton'
import { Loading } from '../../../components/ui/Loading'
import { EmptyState } from '../../../components/ui/EmptyState'

const ConversationsSidebar = memo(({
  conversations,
  activeChat,
  loading,
  error,
  onConversationSelect,
  onConversationDelete,
  onSearchChange,
  onNewChatClick,
  onCreateChat,
  searchResults = [],
  isSearching = false
}) => {
  if (loading) {
    return (
      <div className="conversations-sidebar">
        <div className="sidebar-header">
          <SearchInput 
            onSearch={() => {}}
            placeholder="Пошук розмов..."
            disabled
          />
          <NewChatButton onClick={() => {}} disabled />
        </div>
        <div className="conversations-list">
          <Loading />
        </div>
      </div>
    )
  }

  return (
    <div className="conversations-sidebar">
      <div className="sidebar-header">
        <SearchInput 
          onSearch={onSearchChange}
          onCreateChat={onCreateChat}
          placeholder="Пошук розмов..."
        />
        <NewChatButton onClick={onNewChatClick} />
      </div>

      <div className="conversations-list">
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {isSearching ? (
          searchResults.length === 0 ? (
            <div className="empty-state">
              <h3>Користувачів не знайдено</h3>
              <p>Спробуйте змінити запит або додайте нових друзів у розділі 'Друзі'.</p>
            </div>
          ) : (
            searchResults.map((friend) => (
              <div 
                key={friend.id || friend._id} 
                className="search-result-item"
                onClick={() => onCreateChat(friend.id || friend._id)}
              >
                <div className="search-result-avatar">
                  {friend.avatar ? (
                    <img src={friend.avatar} alt={friend.name} />
                  ) : (
                    friend.name?.charAt(0) || friend.firstName?.charAt(0) || '?'
                  )}
                </div>
                <div className="search-result-info">
                  <div className="search-result-name">
                    {friend.name || `${friend.firstName} ${friend.lastName}`}
                  </div>
                  {friend.username && (
                    <div className="search-result-username">@{friend.username}</div>
                  )}
                </div>
              </div>
            ))
          )
        ) : conversations.length === 0 ? (
          <div className="empty-state">
            <h3>Немає розмов</h3>
            <p>У вас поки немає доданих друзів для спілкування. Знайдіть друзів через пошук вище або додайте нових друзів у розділі 'Друзі'.</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation._id}
              conversation={conversation}
              isActive={activeChat === conversation._id}
              onSelect={() => onConversationSelect(conversation._id)}
              onDelete={() => onConversationDelete(conversation._id)}
            />
          ))
        )}
      </div>
    </div>
  )
})

ConversationsSidebar.displayName = 'ConversationsSidebar'

export default ConversationsSidebar