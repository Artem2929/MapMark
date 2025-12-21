import { useState, useEffect } from 'react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { aboutSchema } from './About.schema';
import './About.css';

const About = () => {
  const [stats, setStats] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const {
    data,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset
  } = useFormValidation({ name: '', email: '', message: '' }, aboutSchema);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const [statsRes, teamRes] = await Promise.all([
          fetch('http://localhost:3001/api/about/stats').catch(() => ({ ok: false })),
          fetch('http://localhost:3001/api/about/team').catch(() => ({ ok: false }))
        ]);
        
        if (!isMounted) return;
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success && isMounted) setStats(statsData.data);
        }
        
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          if (teamData.success && isMounted) setTeam(teamData.data);
        }
      } catch (error) {
        if (isMounted) console.error('Error fetching about data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      setToast({ message: 'Помилка валідації', type: 'error' });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/about/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          message: data.message.trim()
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        reset();
        setToast({ message: 'Повідомлення надіслано успішно!', type: 'success' });
      } else {
        setToast({ message: result.message || 'Помилка відправки', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Помилка мережі', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="about-page">
        <div className="about-container">
          <p>Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container about-page">
      {/* Hero Section */}
      <div className="about-hero section">
        <div className="about-container">
          <div className="about-hero-content">
            <h1 className="about-hero-title">Про MapMark</h1>
            <p className="about-hero-description">
              Ваш надійний провідник у світі подорожей та відкриттів
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="section">
          <div className="about-container">
            <h2 className="section-title">Наші досягнення</h2>
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
                <div className="about-stat-label">Фото</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mission Section */}
      <div className="section">
        <div className="about-container">
          <div className="content-card">
            <h2 className="section-title">Наша місія</h2>
            <p>
              MapMark створений для того, щоб допомогти мандрівникам знаходити найкращі місця, 
              ділитися досвідом та створювати незабутні спогади. Ми віримо, що кожна подорож 
              має бути особливою та наповненою відкриттями.
            </p>
            <div className="about-features-list">
              <div className="about-feature-item">
                <span className="about-feature-icon">🗺️</span>
                <span>Інтерактивні карти</span>
              </div>
              <div className="about-feature-item">
                <span className="about-feature-icon">📸</span>
                <span>Фото та відгуки</span>
              </div>
              <div className="about-feature-item">
                <span className="about-feature-icon">⭐</span>
                <span>Рейтинги місць</span>
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
            <h2 className="section-title">Наша команда</h2>
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
          <h2 className="section-title">Зв'яжіться з нами</h2>
          <div className="about-contact-content">
            <div className="about-contact-info">
              <h3>Маєте питання?</h3>
              <p>
                Ми завжди раді допомогти! Напишіть нам, і ми відповімо якомога швидше.
              </p>
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
              {toast && (
                <div className={`toast ${toast.type}`}>
                  {toast.message}
                </div>
              )}
              
              <div className="about-form-group">
                <input
                  type="text"
                  className={errors.name && touched.name ? 'error' : ''}
                  value={data.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="Ваше ім'я"
                  disabled={submitting}
                />
                {errors.name && touched.name && (
                  <span className="about-field-error">{errors.name}</span>
                )}
              </div>

              <div className="about-form-group">
                <input
                  type="email"
                  className={errors.email && touched.email ? 'error' : ''}
                  value={data.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="Ваш email"
                  disabled={submitting}
                />
                {errors.email && touched.email && (
                  <span className="about-field-error">{errors.email}</span>
                )}
              </div>

              <div className="about-form-group">
                <textarea
                  className={errors.message && touched.message ? 'error' : ''}
                  value={data.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  onBlur={() => handleBlur('message')}
                  placeholder="Ваше повідомлення"
                  disabled={submitting}
                />
                {errors.message && touched.message && (
                  <span className="about-field-error">{errors.message}</span>
                )}
              </div>

              <button type="submit" disabled={submitting}>
                {submitting ? 'Надсилання...' : 'Надіслати'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;