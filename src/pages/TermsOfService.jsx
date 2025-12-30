import React, { useState, useEffect } from 'react'
import Skeleton from '../components/ui/Skeleton/Skeleton'
import './TermsOfService.css'

const TermsOfService = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="terms-of-service">
        <div className="terms-container">
          <header className="terms-header">
            <Skeleton width="300px" height="40px" className="mb-3" />
            <Skeleton width="400px" height="20px" className="mb-2" />
            <Skeleton width="200px" height="16px" />
          </header>

          <div className="terms-content">
            {[1, 2, 3, 4, 5].map(i => (
              <section key={i} className="terms-section">
                <Skeleton width="250px" height="28px" className="mb-3" />
                <Skeleton width="100%" height="16px" className="mb-2" />
                <Skeleton width="90%" height="16px" />
              </section>
            ))}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="terms-of-service">
      <div className="terms-container">
        <header className="terms-header">
          <h1 className="terms-title">Умови використання</h1>
          <p className="terms-subtitle">Правила та умови використання сервісу MapMark</p>
          <p className="terms-date">Останнє оновлення: 27 грудня 2024</p>
        </header>

        <div className="terms-content">
          <section className="terms-section">
            <h2>1. Прийняття умов</h2>
            <p>Використовуючи сервіс MapMark, ви погоджуєтесь з цими умовами використання.</p>
          </section>

          <section className="terms-section">
            <h2>2. Опис сервісу</h2>
            <p>MapMark - це платформа для обміну фотографіями та спілкування з друзями.</p>
          </section>

          <section className="terms-section">
            <h2>3. Користувацький акаунт</h2>
            <p>Ви несете відповідальність за безпеку свого акаунта та всі дії, що здійснюються під ним.</p>
          </section>

          <section className="terms-section">
            <h2>4. Контент користувачів</h2>
            <p>Ви зберігаете права на контент, який публікуєте, але надаєте нам ліцензію на його використання.</p>
          </section>

          <section className="terms-section">
            <h2>5. Контактна інформація</h2>
            <p>З питань щодо умов використання звертайтесь: <strong>legal@mapmark.com</strong></p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TermsOfService