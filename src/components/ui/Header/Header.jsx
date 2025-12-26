import React from 'react'
import { Link } from 'react-router-dom'
import { useHeaderNavigation } from '../../../hooks/useHeaderNavigation'
import { ROUTES, NAVIGATION_LABELS } from '../../../constants/header'
import './Header.css'

export const Header = React.memo(function Header() {
  const {
    isMenuOpen,
    isAuthenticated,
    user,
    authLink,
    handleLogout,
    closeMenu,
    toggleMenu
  } = useHeaderNavigation()

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__logo">
          MapMark
        </div>
        
        <nav className="header__nav header__nav--desktop">
          <Link 
            to={ROUTES.ABOUT} 
            className="header__link header__link--about"
          >
            {NAVIGATION_LABELS.ABOUT}
          </Link>
          {isAuthenticated ? (
            <>
              <Link 
                to={ROUTES.PROFILE(user?.id)} 
                className="header__link header__link--profile"
              >
                {NAVIGATION_LABELS.PROFILE}
              </Link>
              <button
                className="header__link header__link--logout"
                onClick={handleLogout}
              >
                {NAVIGATION_LABELS.LOGOUT}
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
          onClick={toggleMenu}
          aria-label={NAVIGATION_LABELS.MENU}
        >
          <span className={`header__hamburger ${isMenuOpen ? 'header__hamburger--open' : ''}`}></span>
        </button>
      </div>

      <nav className={`header__nav--mobile ${isMenuOpen ? 'header__nav--mobile-open' : ''}`}>
        <Link 
          to={ROUTES.ABOUT} 
          className="header__mobile-link"
          onClick={closeMenu}
        >
          {NAVIGATION_LABELS.ABOUT}
        </Link>
        {isAuthenticated ? (
          <>
            <Link 
              to={ROUTES.PROFILE(user?.id)} 
              className="header__mobile-link"
              onClick={closeMenu}
            >
              {NAVIGATION_LABELS.PROFILE}
            </Link>
            <button 
              className="header__mobile-link header__mobile-link--logout"
              onClick={handleLogout}
            >
              {NAVIGATION_LABELS.LOGOUT}
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
})