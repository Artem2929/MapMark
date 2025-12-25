import { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../app/store'
import { ROUTES, NAVIGATION_LABELS } from '../constants/header'

export function useHeaderNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = useCallback(async () => {
    try {
      clearAuth()
      setIsMenuOpen(false)
      navigate(ROUTES.LOGIN)
    } catch (error) {
      console.error('Помилка виходу:', error)
      clearAuth()
      setIsMenuOpen(false)
      navigate(ROUTES.LOGIN)
    }
  }, [clearAuth, navigate])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  const getAuthLink = useCallback(() => {
    if (location.pathname === ROUTES.LOGIN) {
      return { to: ROUTES.REGISTER, text: NAVIGATION_LABELS.REGISTER }
    }
    if (location.pathname === ROUTES.REGISTER) {
      return { to: ROUTES.LOGIN, text: NAVIGATION_LABELS.LOGIN }
    }
    return { to: ROUTES.LOGIN, text: NAVIGATION_LABELS.LOGIN }
  }, [location.pathname])

  return {
    isMenuOpen,
    isAuthenticated,
    user,
    authLink: getAuthLink(),
    handleLogout,
    closeMenu,
    toggleMenu
  }
}