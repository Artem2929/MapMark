import { useState, useEffect } from 'react';

/**
 * Custom hook for localStorage management with React state sync
 * @param {string} key - localStorage key
 * @param {*} initialValue - Initial value if key doesn't exist
 * @returns {[*, function]} Current value and setter function
 */
export function useLocalStorage(key, initialValue) {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to this key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

/**
 * Hook for managing boolean values in localStorage
 * @param {string} key - localStorage key
 * @param {boolean} initialValue - Initial boolean value
 * @returns {[boolean, function, function, function]} [value, setValue, toggle, reset]
 */
export function useLocalStorageBoolean(key, initialValue = false) {
  const [value, setValue] = useLocalStorage(key, initialValue);

  const toggle = () => setValue(prev => !prev);
  const reset = () => setValue(initialValue);

  return [Boolean(value), setValue, toggle, reset];
}

/**
 * Hook for managing arrays in localStorage
 * @param {string} key - localStorage key
 * @param {Array} initialValue - Initial array value
 * @returns {[Array, function, function, function, function]} [array, setArray, addItem, removeItem, clear]
 */
export function useLocalStorageArray(key, initialValue = []) {
  const [array, setArray] = useLocalStorage(key, initialValue);

  const addItem = (item) => {
    setArray(prev => [...prev, item]);
  };

  const removeItem = (index) => {
    setArray(prev => prev.filter((_, i) => i !== index));
  };

  const removeItemByValue = (value) => {
    setArray(prev => prev.filter(item => item !== value));
  };

  const clear = () => setArray([]);

  return [array, setArray, addItem, removeItem, removeItemByValue, clear];
}