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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return "Ім'я обов'язкове";
        if (value.trim().length < 2) return "Ім'я повинно містити мінімум 2 символи";
        if (value.trim().length > 50) return "Ім'я не може перевищувати 50 символів";
        return '';
      case 'email':
        if (!value.trim()) return "Email обов'язковий";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return 'Введіть коректний email';
        return '';
      case 'message':
        if (!value.trim()) return "Повідомлення обов'язкове";
        if (value.trim().length < 10) return 'Повідомлення повинно містити мінімум 10 символів';
        if (value.trim().length > 1000) return 'Повідомлення не може перевищувати 1000 символів';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(contactForm).forEach(key => {
      const error = validateField(key, contactForm[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name, value) => {
    setContactForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleInputBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, contactForm[name]) }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setToast({ message: 'Будь ласка, виправте помилки у формі', type: 'error' });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/about/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactForm.name.trim(),
          email: contactForm.email.trim().toLowerCase(),
          message: contactForm.message.trim()
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setContactForm({ name: '', email: '', message: '' });
        setErrors({});
        setTouched({});
        setToast({ message: 'Повідомлення надіслано успішно!', type: 'success' });
      } else {
        if (data.errors) {
          const serverErrors = {};
          data.errors.forEach(err => {
            serverErrors[err.field] = err.message;
          });
          setErrors(serverErrors);
        }
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
        <div className="about-container">
          <div className="about-hero-content">
            <h1 className="about-hero-title">Про MapMark</h1>
            <p className="about-hero-description">
              Ваш персональний гід у світі подорожей. Відкривайте нові місця, 
              діліться враженнями та створюйте незабутні спогади.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="about-stats-section">
          <div className="about-container">
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
      <div className="about-mission-section">
        <div className="about-container">
          <div className="about-mission-content">
            <h2>Наша місія</h2>
            <p>
              Ми віримо, що кожна подорож - це можливість відкрити щось нове. 
              MapMark допомагає мандрівникам знаходити найкращі місця, 
              ділитися досвідом та надихати інших на нові пригоди.
            </p>
            <div className="about-features-list">
              <div className="about-feature-item">
                <span className="about-feature-icon">🗺️</span>
                <span>Інтерактивні карти</span>
              </div>
              <div className="about-feature-item">
                <span className="about-feature-icon">📸</span>
                <span>Фотогалереї</span>
              </div>
              <div className="about-feature-item">
                <span className="about-feature-icon">⭐</span>
                <span>Рейтинги та відгуки</span>
              </div>
              <div className="about-feature-item">
                <span className="about-feature-icon">🌍</span>
                <span>Глобальна спільнота</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      {team.length > 0 && (
        <div className="about-team-section">
          <div className="about-container">
            <h2>Наша команда</h2>
            <div className="about-team-grid">
              {team.map((member) => (
                <div key={member._id} className="about-team-card">
                  <div className="about-team-avatar">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} />
                    ) : (
                      <div className="about-avatar-placeholder">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3>{member.name}</h3>
                  <p className="about-team-role">{member.role}</p>
                  <p className="about-team-bio">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="about-contact-section">
        <div className="about-container">
          <h2>Зв'яжіться з нами</h2>
          <div className="about-contact-content">
            <div className="about-contact-info">
              <h3>Маєте питання?</h3>
              <p>Ми завжди раді допомогти! Напишіть нам, і ми відповімо якнайшвидше.</p>
              <div className="about-contact-details">
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
            <form className="about-contact-form" onSubmit={handleContactSubmit}>
              <div className="about-form-group">
                <input
                  type="text"
                  placeholder="Ваше ім'я"
                  value={contactForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={() => handleInputBlur('name')}
                  className={errors.name && touched.name ? 'error' : ''}
                  required
                />
                {errors.name && touched.name && (
                  <span className="about-field-error">{errors.name}</span>
                )}
              </div>
              <div className="about-form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={contactForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleInputBlur('email')}
                  className={errors.email && touched.email ? 'error' : ''}
                  required
                />
                {errors.email && touched.email && (
                  <span className="about-field-error">{errors.email}</span>
                )}
              </div>
              <div className="about-form-group">
                <textarea
                  placeholder="Ваше повідомлення"
                  rows="5"
                  value={contactForm.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  onBlur={() => handleInputBlur('message')}
                  className={errors.message && touched.message ? 'error' : ''}
                  required
                ></textarea>
                {errors.message && touched.message && (
                  <span className="about-field-error">{errors.message}</span>
                )}
              </div>
              <button type="submit" disabled={submitting || Object.keys(errors).some(key => errors[key]) || !contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()}>
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