import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthService from "../../services/authService";

import "./Header.css";

const Header = ({ onSearch, isCountriesVisible, setIsCountriesVisible, isReviewFormOpen = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchPlaceholder, setSearchPlaceholder] = useState('');
  const { t, i18n } = useTranslation();
  const langDropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Animated placeholder effect
  useEffect(() => {
    const baseText = t('search.placeholder').replace('...', '');
    let dotCount = 0;
    
    const interval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      const dots = '.'.repeat(dotCount);
      setSearchPlaceholder(baseText + dots);
    }, 500);
    
    return () => clearInterval(interval);
  }, [t]);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ua', name: 'Українська' },
    // { code: 'es', name: 'Español' },
    // { code: 'fr', name: 'Français' },
    // { code: 'de', name: 'Deutsch' },
    // { code: 'it', name: 'Italiano' },
    // { code: 'pt', name: 'Português' },
    // { code: 'ru', name: 'Русский' },
    // { code: 'ja', name: '日本語' },
    // { code: 'zh-CN', name: '中文' },
    // { code: 'ar', name: 'العربية' },
    // { code: 'hi', name: 'हिन्दी' }
  ];

  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLang = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsLangOpen(false);
  };

  const handleSearch = () => {
    if (searchQuery && onSearch) {
      onSearch(searchQuery);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      // Якщо користувач увійшов через Google, виходимо з Google
      const authProvider = localStorage.getItem('authProvider');

      
      AuthService.logout();
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Все одно очищуємо локальні дані
      AuthService.logout();
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
      navigate('/');
      window.location.reload();
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          PinPoint
        </Link>
        
        {/* Search Bar - only on home page */}
        {isHomePage && !isReviewFormOpen && (
          <div className="search-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="search-input"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="header-search-btn">
              {t('search.button')}
            </button>
          </div>
        )}
        
        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          {/* Profile/Login Button */}
          {localStorage.getItem('userId') ? (
            <div className="user-dropdown" ref={userMenuRef}>
              <button 
                className="user-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                {localStorage.getItem('userName') || t('header.profile')}
                <span className={`arrow ${isUserMenuOpen ? 'up' : 'down'}`}>▼</span>
              </button>
              <div className={`user-menu ${isUserMenuOpen ? 'open' : ''}`}>
                <Link
                  to={`/profile/${localStorage.getItem('userId')}`}
                  className="user-menu-item"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  {t('header.profile')}
                </Link>
                <button
                  className="user-menu-item logout-btn"
                  onClick={handleLogout}
                >
                  {t('header.logout')}
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="header-link login-link">
              {t('header.login')}
            </Link>
          )}
          
          <Link to="/discover-places" className={`header-link ${location.pathname === '/discover-places' ? 'active' : ''}`}>
            {t('header.discover')}
          </Link>
          <Link to="/ads" className={`header-link ${location.pathname === '/ads' ? 'active' : ''}`}>
            {t('header.listings')}
          </Link>
          <Link to="/about" className={`header-link ${location.pathname === '/about' ? 'active' : ''}`}>
            {t('header.about')}
          </Link>
          
          {/* Countries Toggle - only on home page */}
          {isHomePage && !isReviewFormOpen && (
            <button 
              className="countries-btn"
              onClick={() => setIsCountriesVisible && setIsCountriesVisible(!isCountriesVisible)}
            >
              {t('header.countries')}
              <span className={`arrow ${isCountriesVisible ? 'up' : 'down'}`}>▼</span>
            </button>
          )}
          
          {/* Language Dropdown */}
          <div className="lang-dropdown" ref={langDropdownRef}>
            <button 
              className="lang-btn"
              onClick={() => setIsLangOpen(!isLangOpen)}
            >
              {currentLang.name}
              <span className={`arrow ${isLangOpen ? 'up' : 'down'}`}>▼</span>
            </button>
            <div className={`lang-menu ${isLangOpen ? 'open' : ''}`}>
              {languages.map(lang => (
                <button
                  key={lang.code}
                  className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
                  onClick={() => changeLang(lang.code)}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
        {/* Mobile Profile/Login Button */}
        {localStorage.getItem('userId') ? (
          <>
            <Link 
              to={`/profile/${localStorage.getItem('userId')}`} 
              className="mobile-link profile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('header.profile')}
            </Link>
            <button 
              className="mobile-link logout-btn"
              onClick={handleLogout}
            >
              {t('header.logout')}
            </button>
          </>
        ) : (
          <Link 
            to="/login" 
            className="mobile-link login-link"
            onClick={() => setIsMenuOpen(false)}
          >
            {t('header.login')}
          </Link>
        )}
        
        <Link 
          to="/discover-places" 
          className="mobile-link"
          onClick={() => setIsMenuOpen(false)}
        >
          {t('header.discover')}
        </Link>
        <Link 
          to="/ads" 
          className="mobile-link"
          onClick={() => setIsMenuOpen(false)}
        >
          {t('header.listings')}
        </Link>
        <Link 
          to="/about" 
          className="mobile-link"
          onClick={() => setIsMenuOpen(false)}
        >
          {t('header.about')}
        </Link>
        
        {/* Mobile Language Selector */}
        <div className="mobile-lang">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`mobile-lang-btn ${i18n.language === lang.code ? 'active' : ''}`}
              onClick={() => changeLang(lang.code)}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;