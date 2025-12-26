import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../app/store'
import './HomePage.css'

export function HomePage() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <div className="home-page">
      <div className="home-container">
        <header className="home-header">
          <h1>MapMark</h1>
          <p className="home-subtitle">Платформа для обміну враженнями та спогадами</p>
        </header>
        
        <section className="home-content">
          {isAuthenticated ? (
            <div className="home-welcome">
              <h2>Привіт, {user?.name || user?.email}!</h2>
              <p>Ласкаво просимо до MapMark. Почніть ділитися своїми спогадами!</p>
              <div className="home-actions">
                <Link to={`/profile/${user?.id}`} className="btn btn--primary">
                  Мій профіль
                </Link>
                <Link to="/about" className="btn btn--secondary">
                  Про нас
                </Link>
              </div>
            </div>
          ) : (
            <div className="home-auth">
              <h2>Почніть свою подорож</h2>
              <p>Приєднайтесь до нашої спільноти та діліться своїми незабутніми моментами.</p>
              <div className="home-actions">
                <Link to="/register" className="btn btn--primary">
                  Зареєструватись
                </Link>
                <Link to="/login" className="btn btn--secondary">
                  Увійти
                </Link>
              </div>
              <Link to="/about" className="home-about-link">
                Дізнатись більше про MapMark
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}