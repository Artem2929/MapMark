import React, { useState, useEffect } from 'react'
import { User, Image, MessageCircle, Star } from 'lucide-react'
import ContactForm from '../features/contact/components/ContactForm'
import Skeleton from '../components/ui/Skeleton/Skeleton'
import './AboutPage.css'

const AboutPage = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="about-page">
        <div className="about-container">
          <header className="about-header">
            <Skeleton width="200px" height="40px" className="mb-3" />
            <Skeleton width="300px" height="20px" />
          </header>
          
          <section className="about-content">
            <div className="about-section">
              <Skeleton width="150px" height="28px" className="mb-3" />
              <Skeleton width="100%" height="16px" className="mb-2" />
              <Skeleton width="100%" height="16px" className="mb-2" />
              <Skeleton width="80%" height="16px" />
            </div>
            
            <div className="about-section">
              <Skeleton width="180px" height="28px" className="mb-3" />
              <div className="about-features">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="about-feature">
                    <Skeleton width="20px" height="20px" variant="circular" />
                    <Skeleton width="200px" height="16px" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="about-section">
              <Skeleton width="140px" height="28px" className="mb-3" />
              <Skeleton width="100%" height="16px" className="mb-2" />
              <Skeleton width="100%" height="16px" className="mb-2" />
              <Skeleton width="90%" height="16px" />
            </div>
          </section>
        </div>
      </div>
    )
  }
  return (
    <div className="about-page">
      <div className="about-container">
        <header className="about-header">
          <h1>Про MapMark</h1>
          <p className="about-subtitle">Ваша платформа для обміну враженнями та спогадами</p>
        </header>
        
        <section className="about-content">
          <div className="about-section">
            <h2>Наша місія</h2>
            <p>
              MapMark створений для того, щоб допомогти людям ділитися своїми подорожами, 
              враженнями та спогадами з друзями та близькими. Ми віримо, що кожна історія 
              заслуговує на те, щоб бути розказаною.
            </p>
          </div>
          
          <div className="about-section">
            <h2>Що ми пропонуємо</h2>
            <div className="about-features">
              <div className="about-feature">
                <span className="about-feature-icon">
                  <User size={20} />
                </span>
                <span>Створення персонального профілю</span>
              </div>
              <div className="about-feature">
                <span className="about-feature-icon">
                  <Image size={20} />
                </span>
                <span>Обмін фотографіями та історіями</span>
              </div>
              <div className="about-feature">
                <span className="about-feature-icon">
                  <MessageCircle size={20} />
                </span>
                <span>Спілкування з друзями</span>
              </div>
              <div className="about-feature">
                <span className="about-feature-icon">
                  <Star size={20} />
                </span>
                <span>Збереження спогадів назавжди</span>
              </div>
            </div>
          </div>
          
          <div className="about-section">
            <h2>Наша команда</h2>
            <p>
              Ми - команда ентузіастів, які люблять подорожувати та ділитися враженнями. 
              MapMark народився з нашого бажання створити простий та зручний спосіб 
              зберігати та ділитися найкращими моментами життя.
            </p>
          </div>
          
          <div className="about-section">
            <h2>Зв'яжіться з нами</h2>
            <div className="about-contact-content">
              <div className="about-contact-info">
                <h3>Маєте питання?</h3>
                <p>Ми завжди раді допомогти! Напишіть нам, і ми відповімо якомога швидше.</p>
                <div className="about-contact">
                  <div className="about-contact-item">
                    <span className="about-contact-icon">📧</span>
                    <span>support@mapmark.com</span>
                  </div>
                  <div className="about-contact-item">
                    <span className="about-contact-icon">🌐</span>
                    <span>www.mapmark.com</span>
                  </div>
                </div>
              </div>
              
              <ContactForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AboutPage