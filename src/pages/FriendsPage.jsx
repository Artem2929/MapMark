import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../app/store'
import { friendsService } from '../features/friends/services/friendsService'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import FriendCard from '../components/FriendCard'
import FriendCardSkeleton from '../components/ui/FriendCardSkeleton'
import { useFriends } from '../hooks/useFriends'
import { useFriendRequests } from '../hooks/useFriendRequests'
import { useUserSearch } from '../hooks/useUserSearch'
import './FriendsPage.css'

const Friends = () => {
  const { userId: urlUserId } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [dropdownOpen, setDropdownOpen] = useState(null)

  // Використовуємо userId з URL або поточного користувача
  const userId = urlUserId || user?.id

  const { friends, loading: friendsLoading, removeFriend, reloadFriends, setFriends } = useFriends(userId)
  const { requests, loading: requestsLoading, acceptRequest, rejectRequest, setRequests } = useFriendRequests(userId)
  const { 
    query, 
    setQuery, 
    results, 
    randomUsers, 
    loading: searchLoading, 
    loadRandomUsers, 
    sendFriendRequest,
    cancelFriendRequest
  } = useUserSearch()

  const handleDropdownToggle = useCallback((friendId) => {
    setDropdownOpen(prev => prev === friendId ? null : friendId)
  }, [])

  const handleDropdownClose = useCallback(() => {
    setDropdownOpen(null)
  }, [])

  const handleRemoveFriendFromMenu = useCallback(async (friendId) => {
    const success = await removeFriend(friendId)
    // Функція removeFriend вже оновлює стан friends
  }, [removeFriend])

  const handleBlockUserFromMenu = useCallback(async (friendId) => {
    try {
      const result = await friendsService.blockUser(friendId)
      if (result.success || result.status === 'success') {
        // Видаляємо заблокованого користувача зі списку друзів
        setFriends(prev => prev.filter(friend => friend.id !== friendId))
      }
    } catch (error) {
      console.error('Помилка блокування:', error)
    }
  }, [setFriends])

  const handleSendMessageFromMenu = useCallback((friendId) => {
    navigate(`/messages/${friendId}`)
  }, [navigate])

  const handleAcceptRequest = useCallback(async (requestId) => {
    const success = await acceptRequest(requestId)
    if (success) {
      reloadFriends()
      // Заявка вже видалена в хуку acceptRequest
    }
  }, [acceptRequest, reloadFriends])

  const handleRejectRequest = useCallback(async (requestId) => {
    const success = await rejectRequest(requestId)
    if (success) {
      // Заявка вже видалена в хуку rejectRequest
    }
  }, [rejectRequest])

  const handleSendFriendRequestFromRequests = useCallback(async (userId) => {
    const success = await sendFriendRequest(userId)
    if (success) {
      // Знаходимо користувача з заявок
      const userRequest = requests.find(request => 
        request.requester?.id === userId || request.id === userId
      )
      
      if (userRequest) {
        // Додаємо до списку друзів
        const newFriend = userRequest.requester || userRequest
        setFriends(prev => [...prev, newFriend])
        
        // Видаляємо з заявок
        setRequests(prev => prev.filter(request => 
          request.requester?.id !== userId && request.id !== userId
        ))
      }
    }
  }, [sendFriendRequest, setRequests, setFriends, requests])

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
    if (tab === 'search' && randomUsers.length === 0) {
      loadRandomUsers()
    }
  }, [randomUsers.length, loadRandomUsers])

  const renderContent = () => {
    if (activeTab === 'all') {
      if (friendsLoading) return <div className="loading">Завантаження...</div>
      
      return (
        <div className="friends-list">
          {friends.length > 0 ? (
            friends.map(friend => (
              <FriendCard
                key={friend.id}
                friend={friend}
                type="friend"
                dropdownOpen={dropdownOpen}
                onDropdownToggle={handleDropdownToggle}
                onDropdownClose={handleDropdownClose}
                onSendMessage={handleSendMessageFromMenu}
                onRemoveFriend={handleRemoveFriendFromMenu}
                onBlockUser={handleBlockUserFromMenu}
              />
            ))
          ) : (
            <div className="empty-state">
              <p>Друзів не знайдено</p>
            </div>
          )}
        </div>
      )
    }

    if (activeTab === 'requests') {
      if (requestsLoading) return <div className="loading">Завантаження...</div>
      
      return (
        <div className="friends-list">
          {requests.length > 0 ? (
            requests.map(request => (
              <FriendCard
                key={request.id}
                friend={{...request.requester, requestId: request.id}}
                type="request"
                dropdownOpen={dropdownOpen}
                onDropdownToggle={handleDropdownToggle}
                onDropdownClose={handleDropdownClose}
                onAcceptRequest={handleAcceptRequest}
                onRejectRequest={handleRejectRequest}
                onSendFriendRequest={handleSendFriendRequestFromRequests}
              />
            ))
          ) : (
            <div className="empty-state">
              <p>Немає нових заявок</p>
            </div>
          )}
        </div>
      )
    }

    if (activeTab === 'search') {
      return (
        <div className="search-section">
          <div className="search-form">
            <input
              type="text"
              placeholder="Введіть ім'я або прізвище..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="search-results">
            {searchLoading ? (
              <div className="friends-list">
                {Array.from({ length: 6 }).map((_, index) => (
                  <FriendCardSkeleton key={index} />
                ))}
              </div>
            ) : query.trim() ? (
              results.length > 0 ? (
                <div className="friends-list">
                  {results.map(user => (
                    <FriendCard
                      key={user.id}
                      friend={user}
                      type="search"
                      onSendFriendRequest={sendFriendRequest}
                      onCancelRequest={cancelFriendRequest}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Користувачів не знайдено</p>
                </div>
              )
            ) : randomUsers.length > 0 ? (
              <div className="friends-list">
                {randomUsers.map(user => (
                  <FriendCard
                    key={user.id}
                    friend={user}
                    type="search"
                    onSendFriendRequest={sendFriendRequest}
                    onCancelRequest={cancelFriendRequest}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Введіть запит для пошуку друзів</p>
              </div>
            )}
          </div>
        </div>
      )
    }
  }

  return (
    <div className="friends-page">
      <div className="friends-container">
        <Breadcrumbs
          items={[
            { label: 'Профіль', href: `/profile/${userId}` },
            { label: 'Друзі' }
          ]}
        />

        <div className="friends-header">
          <h1>Друзі</h1>
        </div>

        <div className="friends-layout">
          <div className="friends-sidebar">
            <div className="friends-tabs">
              <button
                className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => handleTabChange('all')}
              >
                Всі друзі ({friends.length})
              </button>
              <button
                className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => handleTabChange('requests')}
              >
                Заявки ({requests.length})
              </button>
              <button
                className={`tab ${activeTab === 'search' ? 'active' : ''}`}
                onClick={() => handleTabChange('search')}
              >
                Пошук друзів
              </button>
            </div>
          </div>

          <div className="friends-main-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Friends
