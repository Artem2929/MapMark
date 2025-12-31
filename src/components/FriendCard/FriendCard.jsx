import { memo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DropdownMenu from '../ui/DropdownMenu'
import './FriendCard.css'

const FriendCard = memo(({ 
  friend, 
  type = 'friend',
  dropdownOpen,
  onDropdownToggle,
  onDropdownClose,
  onSendMessage,
  onRemoveFriend,
  onAcceptRequest,
  onRejectRequest,
  onSendFriendRequest,
  onCancelRequest
}) => {
  const navigate = useNavigate()
  const menuButtonRef = useRef(null)

  const handleProfileClick = (e) => {
    e.stopPropagation()
    navigate(`/profile/${friend.id}`)
  }

  const handleMenuToggle = (e) => {
    e.stopPropagation()
    onDropdownToggle(friend.id)
  }

  const renderAvatar = () => (
    <div className="friend-avatar">
      {friend.avatar ? (
        <img
          src={friend.avatar.startsWith('data:') || friend.avatar.startsWith('http') 
            ? friend.avatar 
            : `http://localhost:3001${friend.avatar}`}
          alt={friend.name || `${friend.firstName || ''} ${friend.lastName || ''}`.trim() || 'User avatar'}
        />
      ) : (
        <div className="avatar-placeholder">
          {friend.name ? friend.name.charAt(0) : (friend.firstName ? friend.firstName.charAt(0) : '?')}
        </div>
      )}
    </div>
  )

  const renderFriendMenu = () => (
    <DropdownMenu
      anchorRef={menuButtonRef}
      open={dropdownOpen === friend.id}
      onClose={onDropdownClose}
    >
      <button
        role="menuitem"
        className="btn btn--primary"
        onClick={(e) => {
          e.stopPropagation()
          onSendMessage(friend.id)
          onDropdownClose()
        }}
      >
        Написати
      </button>
      <button
        role="menuitem"
        className="btn btn--danger"
        onClick={(e) => {
          e.stopPropagation()
          onRemoveFriend(friend.id)
          onDropdownClose()
        }}
      >
        Видалити
      </button>
      <button
        role="menuitem"
        className="btn btn--warning"
        onClick={(e) => {
          e.stopPropagation()
          onDropdownClose()
        }}
      >
        Заблокувати
      </button>
    </DropdownMenu>
  )

  const renderRequestMenu = () => (
    <DropdownMenu
      anchorRef={menuButtonRef}
      open={dropdownOpen === friend.id}
      onClose={onDropdownClose}
    >
      <button
        role="menuitem"
        className="btn btn--primary"
        onClick={(e) => {
          e.stopPropagation()
          onAcceptRequest(friend.requestId)
          onDropdownClose()
        }}
      >
        Прийняти
      </button>
      <button
        role="menuitem"
        className="btn btn--danger"
        onClick={(e) => {
          e.stopPropagation()
          onRejectRequest(friend.requestId)
          onDropdownClose()
        }}
      >
        Відхилити
      </button>
      <button
        role="menuitem"
        className="btn btn--success"
        onClick={(e) => {
          e.stopPropagation()
          onSendFriendRequest(friend.id)
          onDropdownClose()
        }}
      >
        Підписатися
      </button>
    </DropdownMenu>
  )

  return (
    <article className="friend-card" onClick={onDropdownClose}>
      <div className="friend-main" onClick={handleProfileClick}>
        {renderAvatar()}
        <div className="friend-info">
          <h3 className="friend-name">
            {friend.name || `${friend.firstName} ${friend.lastName}`}
            {friend.age && `, ${friend.age}`}
          </h3>
          <p className="friend-meta">
            {friend.city && friend.country && `Локація: ${friend.city}, ${friend.country}`}
            {friend.country && !friend.city && `Локація: ${friend.country}`}
            {friend.mutualFriends > 0 && ` • ${friend.mutualFriends} спільних друзів`}
            {type === 'friend' && friend.lastSeen && ` • ${friend.lastSeen}`}
          </p>
        </div>
      </div>

      <div className="friend-actions">
        {(type === 'friend' || type === 'request') && (
          <>
            <button
              ref={menuButtonRef}
              className="btn btn--ghost"
              onClick={handleMenuToggle}
              aria-label="Меню дій"
            >
              ⋯
            </button>
            {type === 'friend' ? renderFriendMenu() : renderRequestMenu()}
          </>
        )}
        
        {type === 'search' && (
          <>
            {friend.relationshipStatus === 'following' ? (
              <>
                <button 
                  className="btn btn--secondary" 
                  disabled
                >
                  Заявка надіслана
                </button>
                <button 
                  className="btn btn--danger" 
                  onClick={() => onCancelRequest(friend.id)}
                >
                  Скасувати
                </button>
              </>
            ) : (
              <button 
                className="btn btn--primary" 
                onClick={() => onSendFriendRequest(friend.id)}
              >
                Підписатися
              </button>
            )}
          </>
        )}
      </div>
    </article>
  )
})

FriendCard.displayName = 'FriendCard'

export default FriendCard