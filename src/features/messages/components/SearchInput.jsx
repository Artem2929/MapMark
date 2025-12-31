import React, { useState, useEffect, useCallback } from 'react'
import { messagesService } from '../services/messagesService'

const SearchInput = ({ onSearch, onCreateChat, placeholder = "Пошук...", disabled = false }) => {
  const [value, setValue] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)

  const searchUsers = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setLoading(true)
    try {
      const results = await messagesService.searchUsers(query)
      setSearchResults(results)
      setShowResults(true)
    } catch (error) {
      console.error('Помилка пошуку:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const debouncedSearch = useCallback((searchValue) => {
    const timeoutId = setTimeout(() => {
      onSearch(searchValue)
      if (searchValue.trim().length >= 2) {
        searchUsers(searchValue)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [onSearch, searchUsers])

  useEffect(() => {
    const cleanup = debouncedSearch(value)
    return cleanup
  }, [value, debouncedSearch])

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      handleCreateChat(searchResults[0])
    }
  }

  const handleCreateChat = async (user) => {
    try {
      await onCreateChat(user.id)
      setValue('')
      setShowResults(false)
    } catch (error) {
      console.error('Помилка створення чату:', error)
    }
  }

  return (
    <div className="search-input">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        className="search-input__field"
      />
      {value && (
        <button
          className="search-input__clear"
          onClick={() => {
            setValue('')
            setShowResults(false)
          }}
          title="Очистити"
        >
          ×
        </button>
      )}
      
      {showResults && (
        <div className="search-results">
          {loading ? (
            <div className="search-result-item loading">
              Пошук...
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map(user => (
              <div 
                key={user.id} 
                className="search-result-item"
                onClick={() => handleCreateChat(user)}
              >
                <div className="search-result-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    user.name?.charAt(0) || user.firstName?.charAt(0) || '?'
                  )}
                </div>
                <div className="search-result-info">
                  <div className="search-result-name">
                    {user.name || `${user.firstName} ${user.lastName}`}
                  </div>
                  {user.username && (
                    <div className="search-result-username">@{user.username}</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="search-result-item empty">
              Користувачів не знайдено
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchInput