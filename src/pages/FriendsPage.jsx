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

const TABS = {
  ALL: 'all',
  REQUESTS: 'requests',
  SEARCH: 'search'
}

const Friends = () => {
  const { userId: urlUserId } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(TABS.ALL)
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [visibleFriendsCount, setVisibleFriendsCount] = useState(20)

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

  const handleRemoveFriend = useCallback(async (friendId) => {
    await removeFriend(friendId)
  }, [removeFriend])

  const handleBlockUser = useCallback(async (friendId) => {
    try {
      const result = await friendsService.blockUser(friendId)
      if (result.success || result.status === 'success') {
        setFriends(prev => prev.filter(friend => friend.id !== friendId))
      }
    } catch (error) {
      console.error('Помилка блокування:', error)
    }
  }, [setFriends])

  const handleSendMessage = useCallback((friendId) => {
    navigate(`/messages/${friendId}`)
  }, [navigate])

  const handleAcceptRequest = useCallback(async (requestId) => {
    const success = await acceptRequest(requestId)
    if (success) {
      reloadFriends()
    }
  }, [acceptRequest, reloadFriends])

  const handleRejectRequest = useCallback(async (requestId) => {
    await rejectRequest(requestId)
  }, [rejectRequest])

  const handleSendFriendRequestFromRequests = useCallback(async (userId) => {
    const success = await sendFriendRequest(userId)
    if (success) {
      const userRequest = requests.find(request => 
        request.requester?.id === userId || request.id === userId
      )
      
      if (userRequest) {
        const newFriend = userRequest.requester || userRequest
        setFriends(prev => [...prev, newFriend])
        setRequests(prev => prev.filter(request => 
          request.requester?.id !== userId && request.id !== userId
        ))
      }
    }
  }, [sendFriendRequest, setRequests, setFriends, requests])

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
    setVisibleFriendsCount(20)
    if (tab === TABS.SEARCH) {
      loadRandomUsers()
    }
  }, [loadRandomUsers])

  const handleLoadMore = useCallback(() => {
    setVisibleFriendsCount(prev => prev + 20)
  }, [])

  const renderFriendsList = (items, type, loading) => {
    if (loading) return <div className="loading">Завантаження...</div>
    
    if (items.length === 0) {
      const emptyMessages = {
        [TABS.ALL]: 'Друзів не знайдено',
        [TABS.REQUESTS]: 'Немає нових заявок'
      }
      
      return (
        <div className="empty-state">
          <p>{emptyMessages[type] || 'Немає даних'}</p>
        </div>
      )
    }

    const visibleItems = type === TABS.ALL ? items.slice(0, visibleFriendsCount) : items
    const hasMore = type === TABS.ALL && items.length > visibleFriendsCount

    return (
      <>
        <div className="friends-list">
          {visibleItems.map(item => {
            const friend = type === TABS.REQUESTS 
              ? {...item.requester, requestId: item.id}
              : item
              
            return (
              <FriendCard
                key={item.id}
                friend={friend}
                type={type === TABS.REQUESTS ? 'request' : 'friend'}
                dropdownOpen={dropdownOpen}
                onDropdownToggle={handleDropdownToggle}
                onDropdownClose={handleDropdownClose}
                onSendMessage={handleSendMessage}
                onRemoveFriend={handleRemoveFriend}
                onBlockUser={handleBlockUser}
                onAcceptRequest={handleAcceptRequest}
                onRejectRequest={handleRejectRequest}
                onSendFriendRequest={handleSendFriendRequestFromRequests}
              />
            )
          })}
        </div>
        {hasMore && (
          <div className="load-more">
            <button className="btn btn--secondary" onClick={handleLoadMore}>
              Завантажити ще
            </button>
          </div>
        )}
      </>
    )
  }

  const renderSearchResults = () => {
    if (searchLoading) {
      return (
        <div className="friends-list">
          {Array.from({ length: 6 }).map((_, index) => (
            <FriendCardSkeleton key={index} />
          ))}
        </div>
      )
    }

    const hasQuery = query.trim()
    const allItems = hasQuery ? results : randomUsers
    const items = allItems
      .filter(user => user.relationshipStatus !== 'friends')
      .slice(0, 20)

    if (hasQuery && items.length === 0) {
      return (
        <div className="empty-state">
          <p>Користувачів не знайдено</p>
        </div>
      )
    }

    if (items.length === 0) {
      return null
    }

    return (
      <div className="friends-list">
        {items.map(user => (
          <FriendCard
            key={user.id}
            friend={user}
            type="search"
            onSendFriendRequest={sendFriendRequest}
            onCancelRequest={cancelFriendRequest}
          />
        ))}
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case TABS.ALL:
        return renderFriendsList(friends, TABS.ALL, friendsLoading)
      case TABS.REQUESTS:
        return renderFriendsList(requests, TABS.REQUESTS, requestsLoading)
      case TABS.SEARCH:
        return (
          <div className="search-section">
            <div className="search-form">
              <input
                type="text"
                placeholder="Введіть ім'я або прізвище..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="form-input"
              />
            </div>
            {renderSearchResults()}
          </div>
        )
      default:
        return null
    }
  }

  const tabs = [
    { key: TABS.ALL, label: `Всі друзі (${friends.length})` },
    { key: TABS.REQUESTS, label: `Заявки (${requests.length})` },
    { key: TABS.SEARCH, label: 'Пошук друзів' }
  ]

  return (
    <div className="page">
      <div className="container">
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
          <div className="sidebar">
            <div className="friends-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="main-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Friends