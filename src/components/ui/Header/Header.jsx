import { useState, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../../app/store'
import './Header.css'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const isLoginPage = location.pathname === '/login'
  const isRegisterPage = location.pathname === '/register'

  const handleLogout = useCallback(async () => {
    try {
      clearAuth()
      setIsMenuOpen(false)
      navigate('/login')
    } catch (error) {
      console.error('Помилка виходу:', error)
      clearAuth()
      setIsMenuOpen(false)
      navigate('/login')
    }
  }, [clearAuth, navigate])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  const getAuthLink = () => {
    if (isLoginPage) {
      return { to: '/register', text: 'Зареєструватись' }
    }
    if (isRegisterPage) {
      return { to: '/login', text: 'Увійти' }
    }
    return { to: '/login', text: 'Увійти' }
  }

  const authLink = getAuthLink()

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__logo">
          MapMark
        </div>
        
        <nav className="header__nav header__nav--desktop">
          {isAuthenticated ? (
            <>
              <Link 
                to={`/profile/${user?.id}`} 
                className="header__link header__link--profile"
              >
                Мій профіль
              </Link>
              <button
                className="header__link header__link--logout"
                onClick={handleLogout}
              >
                Вийти
              </button>
            </>
          ) : (
            <Link to={authLink.to} className="header__link header__link--login">
              {authLink.text}
            </Link>
          )}
        </nav>

        <button 
          className="header__menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Меню"
        >
          <span className={`header__hamburger ${isMenuOpen ? 'header__hamburger--open' : ''}`}></span>
        </button>
      </div>

      <nav className={`header__nav--mobile ${isMenuOpen ? 'header__nav--mobile-open' : ''}`}>
        {isAuthenticated ? (
          <>
            <Link 
              to={`/profile/${user?.id}`} 
              className="header__mobile-link"
              onClick={closeMenu}
            >
              Мій профіль
            </Link>
            <button 
              className="header__mobile-link header__mobile-link--logout"
              onClick={handleLogout}
            >
              Вийти
            </button>
          </>
        ) : (
          <Link 
            to={authLink.to} 
            className="header__mobile-link"
            onClick={closeMenu}
          >
            {authLink.text}
          </Link>
        )}
      </nav>
    </header>
  )
}