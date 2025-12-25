import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuthStore } from '../app/store'

const ProfileContext = createContext()

export const ProfileProvider = ({ children, userId }) => {
  const [user, setUser] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const { user: currentUser } = useAuthStore()
  
  const isOwnProfile = currentUser?.id === userId
  
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setUser(currentUser)
      setServices([])
      setLoading(false)
    }, 500)
  }, [userId, currentUser])

  const addService = (service) => {
    setServices(prev => [...prev, service])
  }

  return (
    <ProfileContext.Provider value={{
      user,
      services,
      loading,
      isOwnProfile,
      targetUserId: userId,
      addService
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider')
  }
  return context
}