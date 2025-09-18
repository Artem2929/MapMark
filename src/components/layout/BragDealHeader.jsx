import React, { useState, useEffect } from 'react';
import './BragDealHeader.css';

const BragDealHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const locations = ['New York', 'Los Angeles', 'Chicago', 'Miami'];
  const navItems = ['Services', 'Projects', 'About', 'Blog', 'Contact'];

  return (
    <header className={`brag-header ${isScrolled ? 'scrolled' : ''}`}>
      {/* Top Bar */}
      <div className="header-top">
        <div className="container">
          <div className="top-left">
            <div className="locations">
              <span className="location-icon">📍</span>
              <span className="location-text">
                {locations.join(', ')}
              </span>
            </div>
          </div>
          
          <div className="top-right">
            <div className="contact-info">
              <a href="tel:+18446042724" className="contact-item">
                <span className="contact-icon">📞</span>
                <span>+1 (844) 604-2724</span>
              </a>
              <a href="mailto:Info@BragDeal.com" className="contact-item">
                <span className="contact-icon">✉️</span>
                <span>Info@BragDeal.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="header-main">
        <div className="container">
          <div className="nav-left">
            <div className="logo">
              <span className="logo-text">BragDeal</span>
            </div>
          </div>

          <div className="nav-right">
            <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
              {navItems.map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="nav-link">
                  {item}
                </a>
              ))}
            </nav>

            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default BragDealHeader;