import React, { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { friendsService } from '../services/friendsService';
import './Friends.css';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ country: '', city: '', ageRange: '' });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [cities, setCities] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const dataLoaded = useRef(false);

  useEffect(() => {
    if (dataLoaded.current) return;
    
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) return;
    
    dataLoaded.current = true;
    loadFriends();
    loadRequests();
    loadSuggestions();
  }, []);

  useEffect(() => {
    if (filters.country) {
      loadCities(filters.country);
    } else {
      setCities([]);
    }
  }, [filters.country]);

  const loadFriends = async () => {
    if (friendsLoading) return;
    
    try {
      setFriendsLoading(true);
      const currentUserId = localStorage.getItem('userId');
      if (!currentUserId) return;
      
      const result = await friendsService.getFriends(currentUserId);
      if (result.success) {
        setFriends(result.data);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
      setFriends([]);
    } finally {
      setFriendsLoading(false);
    }
  };

  const loadRequests = async () => {
    if (requestsLoading) return;
    
    try {
      setRequestsLoading(true);
      const currentUserId = localStorage.getItem('userId');
      if (!currentUserId) return;
      
      const result = await friendsService.getFriendRequests(currentUserId);
      if (result.success) {
        setRequests(result.data);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  const loadSuggestions = () => {
    setSuggestions([
      {
        id: 5,
        name: 'Ірина Мельник',
        avatar: null,
        mutualFriends: 7,
        reason: 'Спільні інтереси'
      },
      {
        id: 6,
        name: 'Сергій Бондар',
        avatar: null,
        mutualFriends: 4,
        reason: 'Живе поруч'
      },
      {
        id: 7,
        name: 'Олександр Коваленко',
        avatar: null,
        mutualFriends: 2,
        reason: 'Київ'
      },
      {
        id: 8,
        name: 'Марина Петренко',
        avatar: null,
        mutualFriends: 9,
        reason: 'Львів'
      }
    ]);
  };

  const loadCities = async (country) => {
    const cityData = {
      'ua': ['Київ', 'Львів', 'Одеса', 'Харків', 'Дніпро'],
      'pl': ['Варшава', 'Краків', 'Гданськ', 'Вроцлав'],
      'de': ['Берлін', 'Мюнхен', 'Гамбург', 'Кельн']
    };
    setCities(cityData[country] || []);
  };

  const searchUsers = async (query, searchFilters) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await friendsService.searchUsers(query, searchFilters);
      if (result.success) {
        setSearchResults(result.data);
      } else {
        setError(result.error || 'Помилка пошуку');
      }
    } catch (err) {
      setError('Помилка пошуку. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query, searchFilters) => {
      searchUsers(query, searchFilters);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query, filters);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    if (filterType === 'country' && value !== filters.country) {
      newFilters.city = ''; // Reset city when country changes
    }
    setFilters(newFilters);
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery, newFilters);
    }
  };

  const handleSearch = () => {
    searchUsers(searchQuery, filters);
  };

  const handleAddFriend = async (userId) => {
    try {
      const result = await friendsService.sendFriendRequest(userId);
      if (result.success) {
        setSearchResults(prev => prev.map(user => 
          user.id === userId ? { ...user, requestSent: true } : user
        ));
      } else {
        setError(result.error || 'Помилка відправки заявки');
      }
    } catch (err) {
      setError('Помилка відправки заявки');
    }
  };

  const handleRemoveFriend = async (userId) => {
    try {
      const result = await friendsService.removeFriend(userId);
      if (result.success) {
        setSearchResults(prev => prev.map(user => 
          user.id === userId ? { ...user, isFriend: false } : user
        ));
        await loadFriends(); // Reload friends list
      } else {
        setError(result.error || 'Помилка видалення з друзів');
      }
    } catch (err) {
      setError('Помилка видалення з друзів');
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAcceptRequest = async (id) => {
    try {
      const result = await friendsService.acceptFriendRequest(id);
      if (result.success) {
        await loadFriends();
        await loadRequests();
      } else {
        setError(result.error || 'Помилка прийняття заявки');
      }
    } catch (err) {
      setError('Помилка прийняття заявки');
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      const result = await friendsService.rejectFriendRequest(id);
      if (result.success) {
        await loadRequests();
      } else {
        setError(result.error || 'Помилка відхилення заявки');
      }
    } catch (err) {
      setError('Помилка відхилення заявки');
    }
  };



  const renderFriendCard = (friend, type = 'friend') => (
    <div key={friend.id} className="friend-card">
      <div className="friend-avatar">
        {friend.avatar ? (
          <img src={friend.avatar} alt={friend.name || `${friend.firstName} ${friend.lastName}`} />
        ) : (
          <div className="avatar-placeholder">
            {friend.name ? friend.name.charAt(0) : friend.firstName.charAt(0)}
          </div>
        )}
        {(type === 'friend' || type === 'search') && (
          <div className={`online-status ${(friend.isOnline || friend.status === 'online') ? 'online' : 'offline'}`}></div>
        )}
      </div>
      <div className="friend-info">
        <h3 className="friend-name">
          {friend.name || `${friend.firstName} ${friend.lastName}`}
          {friend.age && `, ${friend.age}`}
        </h3>
        <p className="friend-meta">
          {friend.city && friend.country && `${friend.city}, ${friend.country}`}
          {friend.mutualFriends > 0 && ` • ${friend.mutualFriends} спільних друзів`}
          {type === 'friend' && friend.lastSeen && ` • ${friend.lastSeen}`}
          {type === 'request' && ` • ${friend.requestDate}`}
          {type === 'suggestion' && ` • ${friend.reason}`}
        </p>
      </div>
      <div className="friend-actions">
        {type === 'friend' && (
          <>
            <button className="btn-message">Написати</button>
            <button className="btn-menu">⋯</button>
          </>
        )}
        {type === 'request' && (
          <>
            <button className="btn-accept" onClick={() => handleAcceptRequest(friend.id)}>
              Прийняти
            </button>
            <button className="btn-reject" onClick={() => handleRejectRequest(friend.id)}>
              Відхилити
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
            {friend.isFriend ? (
              <button className="btn-reject" onClick={() => handleRemoveFriend(friend.id)}>
                Видалити з друзів
              </button>
            ) : friend.requestSent ? (
              <button className="btn-pending" disabled>
                Заявка відправлена
              </button>
            ) : (
              <button className="btn-add" onClick={() => handleAddFriend(friend.id)}>
                Додати в друзі
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="page-container friends-page">
      <div className="friends-container">
        <nav className="breadcrumbs">
          <span className="breadcrumb-item">
            <a className="breadcrumb-link" href="/profile/68fca6b223ea8d70a8da03d8" data-discover="true">Профіль</a>
          </span>
          <span className="breadcrumb-item">
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Друзі</span>
          </span>
        </nav>
        <div className="friends-header">
          <h1>Друзі</h1>
        </div>

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

        <div className="friends-content">
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
                requests.map(request => renderFriendCard(request, 'request'))
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
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="search-input"
                  />
                  <button className="search-btn" onClick={handleSearch}>Пошук</button>
                </div>
                <div className="search-filters">
                  <select 
                    className="filter-select"
                    value={filters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                  >
                    <option value="">Всі країни</option>
                    <option value="ua">Україна</option>
                    <option value="pl">Польща</option>
                    <option value="de">Німеччина</option>
                  </select>
                  <select 
                    className="filter-select"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    disabled={!filters.country}
                  >
                    <option value="">Всі міста</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <select 
                    className="filter-select"
                    value={filters.ageRange}
                    onChange={(e) => handleFilterChange('ageRange', e.target.value)}
                  >
                    <option value="">Будь-який вік</option>
                    <option value="18-25">18-25 років</option>
                    <option value="26-35">26-35 років</option>
                    <option value="36-50">36-50 років</option>
                    <option value="51-65">51-65 років</option>
                  </select>
                </div>
              </div>
              <div className="search-results">
                {error && (
                  <div className="error-message">
                    <p>{error}</p>
                  </div>
                )}
                {loading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Пошук...</p>
                  </div>
                ) : searchQuery.trim() ? (
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
  );
};

export default Friends;