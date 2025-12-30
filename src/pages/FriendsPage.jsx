import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { friendsService } from '../features/friends/services/friendsService'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import './FriendsPage.css'

const Friends = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [filters, setFilters] = useState({ country: '', city: '', ageRange: '' })
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState('')
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [cities, setCities] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const dataLoaded = useRef(false)

  useEffect(() => {
    if (dataLoaded.current) return // Захист від повторних викликів
    
    const initializeFriends = async () => {
      setLoading(true)
      
      const authToken = localStorage.getItem('accessToken')
      if (!authToken) {
        navigate('/login')
        return
      }
      
      const token = localStorage.getItem('accessToken')
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const currentUserId = payload.id
        setCurrentUser({ id: currentUserId })
        
        if (!userId || userId !== currentUserId) {
          navigate(`/friends/${currentUserId}`, { replace: true })
          return
        }
      }
      
      await Promise.all([
        loadFriends(),
        loadRequests()
      ])
      
      setLoading(false)
      dataLoaded.current = true // Позначаємо, що дані завантажені
    }
    
    initializeFriends()
  }, [userId, navigate])

  useEffect(() => {
    if (filters.country) {
      loadCities(filters.country)
    } else {
      setCities([])
    }
  }, [filters.country])

  const loadFriends = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentUserId = payload.id
    
    const result = await friendsService.getFriends(currentUserId)
    if (result.success) {
      setFriends(result.data || [])
    } else {
      setFriends([])
    }
  }

  const loadRequests = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentUserId = payload.id
    
    const result = await friendsService.getFriendRequests(currentUserId)
    if (result.success) {
      setRequests(result.data || [])
    } else {
      setRequests([])
    }
  }

  const loadCities = async (country) => {
    setCities([])
  }

  const searchUsers = async (query, searchFilters = {}) => {
    if (!query.trim() || query.trim().length < 3) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }

    setSearchLoading(true)
    setError('')

    const result = await friendsService.searchUsers(query, searchFilters)
    if (result.success) {
      setSearchResults(result.data || [])
    } else {
      setError(result.error || 'Помилка пошуку')
      setSearchResults([])
    }
    setSearchLoading(false)
  }

  const debouncedSearch = useCallback(
    (query, searchFilters) => {
      const timeoutId = setTimeout(() => {
        searchUsers(query, searchFilters)
      }, 300)
      return () => clearTimeout(timeoutId)
    },
    []
  )

  useEffect(() => {
    const cleanup = debouncedSearch(userSearchQuery, filters)
    return cleanup
  }, [userSearchQuery, filters, debouncedSearch])

  const handleUserSearchChange = (e) => {
    setUserSearchQuery(e.target.value)
  }

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value }
    if (filterType === 'country' && value !== filters.country) {
      newFilters.city = ''
    }
    setFilters(newFilters)
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery, newFilters)
    }
  }

  const handleSearch = () => {
    searchUsers(searchQuery, filters)
  }

  const handleAddFriend = async (userId) => {
    try {
      const result = await friendsService.sendFriendRequest(userId)
      
      if (result.success || result.status === 'success') {
        setSearchResults(prev => prev.map(user => 
          user.id === userId ? { ...user, requestSent: true } : user
        ))
      } else if (result.message === 'Заявка вже надіслана' || result.error === 'Friendship request already exists') {
        setSearchResults(prev => prev.map(user => 
          user.id === userId ? { ...user, requestSent: true } : user
        ))
      } else {
        setError(result.message || result.error || 'Помилка відправки заявки')
      }
    } catch (error) {
      setError('Помилка відправки заявки')
    }
  }

  const handleRemoveFriend = async (userId) => {
    const result = await friendsService.removeFriend(userId)
    if (result.success) {
      setSearchResults(prev => prev.map(user => 
        user.id === userId ? { ...user, isFriend: false } : user
      ))
      await loadFriends()
    } else {
      setError(result.error || 'Помилка видалення з друзів')
    }
  }

  const handleCancelRequest = async (userId) => {
    try {
      const result = await friendsService.cancelFriendRequest(userId)
      
      if (result.success || result.status === 'success') {
        setSearchResults(prev => prev.map(user => 
          user.id === userId ? { ...user, requestSent: false } : user
        ))
      } else {
        setError(result.message || result.error || 'Помилка скасування заявки')
      }
    } catch (error) {
      setError('Помилка скасування заявки')
    }
  }

  const handleRejectFollower = async (userId) => {
    try {
      const result = await friendsService.removeFollower(userId)
      
      if (result.success || result.status === 'success') {
        setSearchResults(prev => prev.map(user => 
          user.id === userId ? { ...user, relationshipStatus: 'none', requestReceived: false } : user
        ))
      } else {
        setError(result.message || result.error || 'Помилка видалення підписника')
      }
    } catch (error) {
      setError('Помилка видалення підписника')
    }
  }

  const filteredFriends = friends.filter(friend => {
    const searchLower = searchQuery.toLowerCase()
    const name = friend.name || `${friend.firstName || ''} ${friend.lastName || ''}`.trim()
    return name.toLowerCase().includes(searchLower)
  })

  const handleAcceptRequest = async (id) => {
    console.log('Accepting request with ID:', id) // Debug
    const result = await friendsService.acceptFriendRequest(id)
    if (result.success || result.status === 'success') {
      await loadFriends()
      await loadRequests()
    } else {
      setError(result.message || result.error || 'Помилка прийняття заявки')
    }
  }

  const handleRejectRequest = async (id) => {
    const result = await friendsService.rejectFriendRequest(id)
    if (result.success || result.status === 'success') {
      setRequests(prev => prev.filter(request => request.id !== id))
    } else {
      setError(result.message || result.error || 'Помилка відхилення заявки')
    }
  }

  const handleSendMessage = (friendId) => {
    navigate(`/messages/${friendId}`)
  }

  const renderFriendCard = (friend, type = 'friend') => (
    <div 
      key={friend.id} 
      className="friend-card"
      onClick={(e) => {
        // Перевіряємо, чи клік не по кнопці
        if (!e.target.closest('button')) {
          navigate(`/profile/${friend.id}`)
        }
        setDropdownOpen(null)
      }}
      style={{ cursor: 'pointer' }}
    >
      <div className="friend-avatar">
        {friend.avatar ? (
          <img 
            src={friend.avatar.startsWith('data:') || friend.avatar.startsWith('http') ? friend.avatar : `http://localhost:3001${friend.avatar}`} 
            alt={friend.name || `${friend.firstName || ''} ${friend.lastName || ''}`.trim() || 'User avatar'} 
          />
        ) : (
          <div className="avatar-placeholder">
            {friend.name ? friend.name.charAt(0) : (friend.firstName ? friend.firstName.charAt(0) : '?')}
          </div>
        )}
      </div>
      <div className="friend-info">
        <h3 className="friend-name">
          {friend.name || `${friend.firstName} ${friend.lastName}`}
          {friend.age && `, ${friend.age}`}
        </h3>
        <p className="friend-meta">
          {friend.city && friend.country && `${friend.city}, ${friend.country}`}
          {friend.country && !friend.city && friend.country}
          {friend.mutualFriends > 0 && ` • ${friend.mutualFriends} спільних друзів`}
          {type === 'friend' && friend.lastSeen && ` • ${friend.lastSeen}`}
          {type === 'suggestion' && ` • ${friend.reason}`}
        </p>
      </div>
      <div className="friend-actions">
        {type === 'friend' && (
          <>
            <button className="btn-message" onClick={() => handleSendMessage(friend.id)}>Написати</button>
            <div className="menu-wrapper">
              <button 
                className="btn-menu" 
                onClick={(e) => {
                  e.stopPropagation()
                  setDropdownOpen(dropdownOpen === friend.id ? null : friend.id)
                }}
              >
                ⋯
              </button>
              {dropdownOpen === friend.id && (
                <div className="friend-menu-buttons">
                  <button 
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveFriend(friend.id)
                      setDropdownOpen(null)
                    }}
                  >
                    Видалити
                  </button>
                  <button 
                    className="btn-block"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDropdownOpen(null)
                    }}
                  >
                    Заблокувати
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        {type === 'request' && (
          <>
            <button className="btn-accept" onClick={() => handleAcceptRequest(friend.requestId)}>
              Прийняти
            </button>
            <button className="btn-reject" onClick={() => handleRejectRequest(friend.requestId)}>
              Відхилити
            </button>
            <button className="btn-add" onClick={() => handleAddFriend(friend.id)}>
              Підписатися у відповідь
            </button>
          </>
        )}
        {type === 'suggestion' && (
          <button className="btn-add" onClick={() => handleAddFriend(friend.id)}>
            Додати в друзі
          </button>
        )}
        {type === 'search' && (
          <>
            {friend.relationshipStatus === 'friends' ? (
              <>
                <button className="btn-message" onClick={() => handleSendMessage(friend.id)}>Написати</button>
                <button className="btn-reject" onClick={() => handleRemoveFriend(friend.id)}>Видалити з друзів</button>
              </>
            ) : friend.relationshipStatus === 'following' ? (
              <>
                <button className="btn-pending" disabled>Підписка відправлена</button>
                <button className="btn-reject" onClick={() => handleCancelRequest(friend.id)}>Відписатися</button>
              </>
            ) : friend.relationshipStatus === 'follower' ? (
              <>
                <button className="btn-accept" onClick={() => handleAddFriend(friend.id)}>Підписатися у відповідь</button>
                <button className="btn-reject" onClick={() => handleRejectFollower(friend.id)}>Видалити підписника</button>
              </>
            ) : (
              <button className="btn-add" onClick={() => handleAddFriend(friend.id)}>Підписатися</button>
            )}
          </>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="friends-page">
        <div className="loading">Завантаження...</div>
      </div>
    )
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
                onClick={() => setActiveTab('all')}
              >
                Всі друзі ({friends.length})
              </button>
              <button
                className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                Заявки ({requests.length})
              </button>
              <button
                className={`tab ${activeTab === 'search' ? 'active' : ''}`}
                onClick={() => setActiveTab('search')}
              >
                Пошук друзів
              </button>
            </div>
          </div>

          <div className="friends-main-content">
          {activeTab === 'all' && (
            <div className="friends-list">
              {filteredFriends.length > 0 ? (
                filteredFriends.map(friend => renderFriendCard(friend, 'friend'))
              ) : (
                <div className="empty-state">
                  <p>Друзів не знайдено</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="friends-list">
              {requests.length > 0 ? (
                requests.map(request => {
                  console.log('Request object:', request) // Debug
                  return renderFriendCard({...request.requester, requestId: request.id}, 'request')
                })
              ) : (
                <div className="empty-state">
                  <p>Немає нових заявок</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div className="search-section">
              <div className="search-form">
                <div className="search-input-group">
                  <input
                    type="text"
                    placeholder="Введіть ім'я або прізвище..."
                    value={userSearchQuery}
                    onChange={handleUserSearchChange}
                    className="search-input"
                  />
                </div>

              </div>
              <div className="search-results">
                {error && (
                  <div className="error-message">
                    <p>{error}</p>
                  </div>
                )}
                {searchLoading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Пошук...</p>
                  </div>
                ) : userSearchQuery.trim() ? (
                  searchResults.length > 0 ? (
                    <div className="friends-list">
                      {searchResults.map(user => renderFriendCard(user, 'search'))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>Користувачів не знайдено</p>
                    </div>
                  )
                ) : (
                  <div className="empty-state">
                    <p>Введіть запит для пошуку друзів</p>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Friends