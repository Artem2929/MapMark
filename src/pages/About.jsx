import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../components/layout/Footer';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';
import './About.css';

const About = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const [statsRes, teamRes] = await Promise.all([
        fetch('http://localhost:3000/api/about/stats'),
        fetch('http://localhost:3000/api/about/team')
      ]);
      
      const statsData = await statsRes.json();
      const teamData = await teamRes.json();
      
      if (statsData.success) setStats(statsData.data);
      if (teamData.success) setTeam(teamData.data);
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/about/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setContactForm({ name: '', email: '', message: '' });
        setToast({ message: 'Повідомлення надіслано успішно!', type: 'success' });
      } else {
        setToast({ message: data.message || 'Помилка відправки', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Помилка мережі', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Завантаження..." />;
  }

  return (
    <>
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Про MapMark</h1>
            <p className="hero-description">
              Ваш персональний гід у світі подорожей. Відкривайте нові місця, 
              діліться враженнями та створюйте незабутні спогади.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="stats-section">
          <div className="container">
            <h2>Наші досягнення</h2>
            <div className="about-stats-grid">
              <div className="about-stat-card">
                <div className="about-stat-number">{stats.totalUsers}</div>
                <div className="about-stat-label">Користувачів</div>
              </div>
              <div className="about-stat-card">
                <div className="about-stat-number">{stats.totalReviews}</div>
                <div className="about-stat-label">Відгуків</div>
              </div>
              <div className="about-stat-card">
                <div className="about-stat-number">{stats.totalCountries}</div>
                <div className="about-stat-label">Країн</div>
              </div>
              <div className="about-stat-card">
                <div className="about-stat-number">{stats.totalPhotos}</div>
                <div className="about-stat-label">Фотографій</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mission Section */}
      <div className="mission-section">
        <div className="container">
          <div className="mission-content">
            <h2>Наша місія</h2>
            <p>
              Ми віримо, що кожна подорож - це можливість відкрити щось нове. 
              MapMark допомагає мандрівникам знаходити найкращі місця, 
              ділитися досвідом та надихати інших на нові пригоди.
            </p>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">🗺️</span>
                <span>Інтерактивні карти</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📸</span>
                <span>Фотогалереї</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⭐</span>
                <span>Рейтинги та відгуки</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌍</span>
                <span>Глобальна спільнота</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      {team.length > 0 && (
        <div className="team-section">
          <div className="container">
            <h2>Наша команда</h2>
            <div className="team-grid">
              {team.map((member) => (
                <div key={member._id} className="team-card">
                  <div className="team-avatar">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3>{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                  <p className="team-bio">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="contact-section">
        <div className="container">
          <h2>Зв'яжіться з нами</h2>
          <div className="contact-content">
            <div className="contact-info">
              <h3>Маєте питання?</h3>
              <p>Ми завжди раді допомогти! Напишіть нам, і ми відповімо якнайшвидше.</p>
              <div className="contact-details">
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <span>support@mapmark.com</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">🌐</span>
                  <span>www.mapmark.com</span>
                </div>
              </div>
            </div>
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Ваше ім'я"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  placeholder="Ваше повідомлення"
                  rows="5"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  required
                ></textarea>
              </div>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Надсилання...' : 'Надіслати'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
    
    <Footer />
    </>
  );
};

export default About;