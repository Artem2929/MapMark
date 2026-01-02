import React, { memo } from 'react'
import ConversationItem from './ConversationItem'
import SearchInput from './SearchInput'
import NewChatButton from './NewChatButton'
import { Loading } from '../../../components/ui/Loading'

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
  userId
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
          placeholder="Пошук друзів..."
          userId={userId}
        />
        <NewChatButton onClick={onNewChatClick} />
      </div>

      <div className="conversations-list">
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {conversations.length === 0 ? (
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