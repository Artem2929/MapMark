import React, { useState, useEffect } from 'react'
import Skeleton from '../components/ui/Skeleton/Skeleton'
import './PrivacyPolicy.css'

const PrivacyPolicy = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="privacy-policy">
        <div className="privacy-container">
          <header className="privacy-header">
            <Skeleton width="350px" height="40px" className="mb-3" />
            <Skeleton width="450px" height="20px" className="mb-2" />
            <Skeleton width="200px" height="16px" />
          </header>

          <div className="privacy-content">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
              <section key={i} className="privacy-section">
                <Skeleton width="200px" height="28px" className="mb-3" />
                <Skeleton width="100%" height="16px" className="mb-2" />
                <Skeleton width="85%" height="16px" className="mb-2" />
                <Skeleton width="70%" height="16px" />
              </section>
            ))}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="privacy-policy">
      <div className="privacy-container">
        <header className="privacy-header">
          <h1 className="privacy-title">Політика конфіденційності</h1>
          <p className="privacy-subtitle">Як ми збираємо, використовуємо та захищаємо ваші дані</p>
          <p className="privacy-date">Останнє оновлення: 27 грудня 2024</p>
        </header>

        <div className="privacy-content">
          <section className="privacy-section">
            <h2>1. Вступ</h2>
            <p>Ця політика конфіденційності описує, як MapMark збирає, використовує та захищає вашу особисту інформацію.</p>
          </section>

          <section className="privacy-section">
            <h2>2. Збір даних</h2>
            <p>Ми збираємо інформацію, яку ви надаєте нам безпосередньо, а також дані про використання сервісу.</p>
            
            <div className="data-types">
              <div className="data-type">
                <h3>Особисті дані</h3>
                <ul>
                  <li>Ім'я та прізвище</li>
                  <li>Електронна пошта</li>
                  <li>Місцезнаходження</li>
                </ul>
              </div>

              <div className="data-type">
                <h3>Дані використання</h3>
                <ul>
                  <li>Взаємодія з сервісом</li>
                  <li>Налаштування</li>
                  <li>Інформація про пристрій</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="privacy-section">
            <h2>3. Використання даних</h2>
            <p>Ми використовуємо зібрані дані для наступних цілей:</p>
            <ul>
              <li>Надання та покращення сервісу</li>
              <li>Персоналізація контенту</li>
              <li>Комунікація з користувачами</li>
              <li>Аналіз та покращення функціональності</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>4. Передача даних</h2>
            <p>Ми не продаємо та не передаємо ваші особисті дані третім сторонам без вашої згоди.</p>
            <div className="privacy-highlight">
              <h4>Винятки</h4>
              <ul>
                <li>Вимоги законодавства</li>
                <li>Забезпечення безпеки</li>
                <li>Бізнес-операції</li>
              </ul>
            </div>
          </section>

          <section className="privacy-section">
            <h2>5. Безпека даних</h2>
            <p>Ми вживаємо технічні та організаційні заходи для захисту ваших даних.</p>
            <div className="privacy-highlight">
              <h4>Заходи безпеки</h4>
              <ul>
                <li>Шифрування даних</li>
                <li>Контроль доступу</li>
                <li>Моніторинг системи</li>
              </ul>
            </div>
          </section>

          <section className="privacy-section">
            <h2>6. Ваші права</h2>
            <p>Ви маєте право на доступ, виправлення та видалення ваших особистих даних.</p>
            <ul>
              <li>Доступ до даних</li>
              <li>Виправлення даних</li>
              <li>Видалення даних</li>
              <li>Портативність даних</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>7. Файли cookie</h2>
            <p>Ми використовуємо файли cookie для покращення роботи сервісу та аналізу використання.</p>
          </section>

          <section className="privacy-section">
            <h2>8. Зміни політики</h2>
            <p>Ми можемо оновлювати цю політику конфіденційності. Про зміни ми повідомимо заздалегідь.</p>
          </section>

          <section className="privacy-section">
            <h2>9. Контакти</h2>
            <p>З питань щодо політики конфіденційності звертайтесь до нас:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> privacy@mapmark.com</p>
              <p><strong>Адреса:</strong> Україна, м. Київ</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy