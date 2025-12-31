import React, { useState, useEffect, useCallback } from 'react'

const SearchInput = ({ onSearch, placeholder = "Пошук...", disabled = false }) => {
  const [value, setValue] = useState('')

  const debouncedSearch = useCallback((searchValue) => {
    const timeoutId = setTimeout(() => {
      onSearch(searchValue)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [onSearch])

  useEffect(() => {
    const cleanup = debouncedSearch(value)
    return cleanup
  }, [value, debouncedSearch])

  return (
    <div className="search-input">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        className="search-input__field"
      />
      {value && (
        <button
          className="search-input__clear"
          onClick={() => setValue('')}
          title="Очистити"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default SearchInput