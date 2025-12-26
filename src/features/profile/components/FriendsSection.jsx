import React, { memo } from 'react'
import './FriendsSection.css'

const FriendsSection = memo(({ friends = [] }) => {
  return (
    <div className="friends-section">
      <div className="friends-section__header">
        <h3 className="friends-section__title">Друзі</h3>
        <span className="friends-section__count">{friends.length}</span>
      </div>
      
      <div className="friends-section__content">
        {friends.length === 0 ? (
          <div className="friends-section__empty">
            <div className="friends-section__empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2.01 1l-2.99 4v7h2v7h4v-7h2zm-7.5-10.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9V9.5C9 8.12 8.12 7 6.5 7S4 8.12 4 9.5V15H5.5v7h2z"/>
              </svg>
            </div>
            <p className="friends-section__empty-text">Друзів поки немає</p>
          </div>
        ) : (
          <div className="friends-section__grid">
            {friends.slice(0, 6).map((friend, index) => (
              <div key={friend.id || index} className="friends-section__item">
                <div className="friends-section__avatar-wrapper">
                  <img 
                    src={friend.avatar} 
                    alt={friend.name}
                    className="friends-section__avatar"
                  />
                </div>
                <span className="friends-section__name">{friend.name}</span>
              </div>
            ))}
          </div>
        )}
        
        {friends.length > 6 && (
          <button className="friends-section__show-all">
            Показати всіх друзів ({friends.length})
          </button>
        )}
      </div>
    </div>
  )
})

FriendsSection.displayName = 'FriendsSection'

export default FriendsSection