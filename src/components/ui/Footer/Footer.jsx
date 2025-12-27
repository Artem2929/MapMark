import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

export const Footer = React.memo(function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          <div className="footer__section">
            <Link to="/" className="footer__logo">
              MapMark
            </Link>
            <p className="footer__description">
              Соціальна мережа для обміну враженнями та спогадами
            </p>
          </div>

          <div className="footer__section">
            <h3 className="footer__title">Навігація</h3>
            <nav className="footer__nav">
              <Link to="/about" className="footer__link">
                Про нас
              </Link>
              <Link to="/friends" className="footer__link">
                Друзі
              </Link>
              <Link to="/photos" className="footer__link">
                Фото
              </Link>
              <Link to="/messages" className="footer__link">
                Повідомлення
              </Link>
            </nav>
          </div>

          <div className="footer__section">
            <h3 className="footer__title">Підтримка</h3>
            <nav className="footer__nav">
              <Link to="/terms" className="footer__link">
                Умови використання
              </Link>
              <Link to="/privacy" className="footer__link">
                Політика конфіденційності
              </Link>
            </nav>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} MapMark. Всі права захищені.
          </p>
        </div>
      </div>
    </footer>
  )
})