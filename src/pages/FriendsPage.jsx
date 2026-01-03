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
import { useEffect, useRef } from 'react'
import './FriendsPage.css'

const TABS = {
  ALL: 'all',
  REQUESTS: 'requests',
  MY_REQUESTS: 'my-requests',
  SEARCH: 'search'
}

const Friends = () => {
  const { userId: urlUserId } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(TABS.ALL)
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [visibleFriendsCount, setVisibleFriendsCount] = useState(20)
  const [visibleRequestsCount, setVisibleRequestsCount] = useState(20)
  const [sentRequests, setSentRequests] = useState([])
  const [sentRequestsLoading, setSentRequestsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef(null)

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

  const loadSentRequests = useCallback(async () => {
    setSentRequestsLoading(true)
    try {
      const result = await friendsService.getSentFriendRequests(userId)
      setSentRequests(result.data || [])
    } catch (error) {
      console.error('Error loading sent requests:', error)
      setSentRequests([])
    } finally {
      setSentRequestsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery) {
      setIsSearching(true)
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          if (activeTab === TABS.ALL) {
            const result = await friendsService.searchFriends(userId, searchQuery)
            setFriends(result.data || [])
          } else if (activeTab === TABS.REQUESTS) {
            const result = await friendsService.searchFriendRequests(userId, searchQuery)
            setRequests(result.data || [])
          } else if (activeTab === TABS.MY_REQUESTS) {
            const result = await friendsService.searchSentFriendRequests(userId, searchQuery)
            setSentRequests(result.data || [])
          }
        } catch (error) {
          console.error('Search error:', error)
        } finally {
          setIsSearching(false)
        }
      }, 500)
    } else {
      setIsSearching(false)
      if (activeTab === TABS.ALL) {
        reloadFriends()
      } else if (activeTab === TABS.REQUESTS) {
        friendsService.getFriendRequests(userId).then(r => setRequests(r.data || []))
      }
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, activeTab, userId, reloadFriends, setFriends, setRequests])

  const handleLoadMore = useCallback(() => {
    setVisibleFriendsCount(prev => prev + 20)
  }, [])

  const renderFriendsList = (items, type, loading) => {
    if (loading || isSearching) return <div className="loading">Завантаження...</div>
    
    const filteredItems = items
    
    if (filteredItems.length === 0) {
      const emptyMessages = {
        [TABS.ALL]: searchQuery ? 'Нічого не знайдено' : 'Друзів не знайдено',
        [TABS.REQUESTS]: searchQuery ? 'Нічого не знайдено' : 'Немає нових заявок'
      }
      
      return (
        <div className="empty-state">
          <p>{emptyMessages[type] || 'Немає даних'}</p>
        </div>
      )
    }

    const visibleCount = type === TABS.ALL ? visibleFriendsCount : visibleRequestsCount
    const visibleItems = filteredItems.slice(0, visibleCount)
    const hasMore = filteredItems.length > visibleCount

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
            <button className="btn btn--secondary" onClick={() => type === TABS.ALL ? handleLoadMore() : setVisibleRequestsCount(prev => prev + 20)}>
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

  const renderSentRequests = () => {
    if (sentRequestsLoading) {
      return <div className="loading">Завантаження...</div>
    }

    const filteredRequests = searchQuery
      ? sentRequests.filter(request => {
          const name = request.recipient.name || ''
          return name.toLowerCase().includes(searchQuery.toLowerCase())
        })
      : sentRequests

    if (filteredRequests.length === 0) {
      return (
        <div className="empty-state">
          <p>{searchQuery ? 'Нічого не знайдено' : 'Немає вихідних заявок'}</p>
        </div>
      )
    }

    return (
      <div className="friends-list">
        {filteredRequests.map(request => (
          <FriendCard
            key={request.id}
            friend={{...request.recipient, requestId: request.id}}
            type="sent-request"
            onCancelRequest={async (userId) => {
              await cancelFriendRequest(userId)
              setSentRequests(prev => prev.filter(r => r.recipient.id !== userId))
            }}
          />
        ))}
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case TABS.ALL:
        return (
          <>
            <div className="search-form">
              <input
                type="text"
                placeholder="Пошук друзів..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
              />
            </div>
            {renderFriendsList(friends, TABS.ALL, friendsLoading)}
          </>
        )
      case TABS.REQUESTS:
        return (
          <>
            <div className="search-form">
              <input
                type="text"
                placeholder="Пошук заявок..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
              />
            </div>
            {renderFriendsList(requests, TABS.REQUESTS, requestsLoading)}
          </>
        )
      case TABS.MY_REQUESTS:
        return (
          <>
            <div className="search-form">
              <input
                type="text"
                placeholder="Пошук заявок..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
              />
            </div>
            {renderSentRequests()}
          </>
        )
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

  const handleDropdownToggle = useCallback((friendId) => {
    setDropdownOpen(prev => prev === friendId ? null : friendId)
  }, [])

  const handleDropdownClose = useCallback(() => {
    setDropdownOpen(null)
  }, [])

  const handleSendMessage = useCallback((friendId) => {
    navigate(`/messages/${friendId}`)
  }, [navigate])

  const handleRemoveFriend = useCallback(async (friendId) => {
    await removeFriend(friendId)
    setDropdownOpen(null)
  }, [removeFriend])

  const handleBlockUser = useCallback((friendId) => {
    console.log('Block user:', friendId)
    setDropdownOpen(null)
  }, [])

  const handleAcceptRequest = useCallback(async (requestId) => {
    await acceptRequest(requestId)
  }, [acceptRequest])

  const handleRejectRequest = useCallback(async (requestId) => {
    await rejectRequest(requestId)
  }, [rejectRequest])

  const handleSendFriendRequestFromRequests = useCallback(async (userId) => {
    await sendFriendRequest(userId)
  }, [sendFriendRequest])

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
    setSearchQuery('')
    if (tab === TABS.MY_REQUESTS) {
      loadSentRequests()
    } else if (tab === TABS.SEARCH) {
      loadRandomUsers()
    }
  }, [loadSentRequests, loadRandomUsers])

  const tabs = [
    { key: TABS.ALL, label: 'Всі друзі' },
    { key: TABS.REQUESTS, label: 'Вхідні заявки' },
    { key: TABS.MY_REQUESTS, label: 'Вихідні заявки' },
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