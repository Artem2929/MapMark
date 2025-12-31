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
  onNewChatClick
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

        {conversations.length === 0 ? (
          <EmptyState 
            title="Немає розмов"
            description="Створіть новий чат для початку спілкування"
          />
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