import React, {  useState, useEffect , useCallback, useMemo } from 'react';
import { classNames } from '../utils/classNames';
import { useOptimizedState } from '../hooks/useOptimizedState';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';
import Breadcrumbs from '../components/ui/Breadcrumbs';
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



  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return t('aboutPage.contact.validation.nameRequired');
        if (value.trim().length < 2) return t('aboutPage.contact.validation.nameMinLength');
        if (value.trim().length > 50) return t('aboutPage.contact.validation.nameMaxLength');
        return '';
      case 'email':
        if (!value.trim()) return t('aboutPage.contact.validation.emailRequired');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return t('aboutPage.contact.validation.emailInvalid');
        return '';
      case 'message':
        if (!value.trim()) return t('aboutPage.contact.validation.messageRequired');
        if (value.trim().length < 10) return t('aboutPage.contact.validation.messageMinLength');
        if (value.trim().length > 1000) return t('aboutPage.contact.validation.messageMaxLength');
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
      setToast({ message: t('aboutPage.contact.messages.validationError'), type: 'error' });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/about/contact', {
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
        setToast({ message: t('aboutPage.contact.messages.success'), type: 'success' });
      } else {
        if (data.errors) {
          const serverErrors = {};
          data.errors.forEach(err => {
            serverErrors[err.field] = err.message;
          });
          setErrors(serverErrors);
        }
        setToast({ message: data.message || t('aboutPage.contact.messages.error'), type: 'error' });
      }
    } catch (error) {
      setToast({ message: t('aboutPage.contact.messages.networkError'), type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Завантаження..." />;
  }

  return (
    <div className="page-container about-page">
      <Breadcrumbs />
      {/* Hero Section */}
      <div className="about-hero section">
        <div className="about-container">
          <div className="about-hero-content">
            <h1 className="about-hero-title">{t('aboutPage.hero.title')}</h1>
            <p className="about-hero-description">
              {t('aboutPage.hero.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="section">
          <div className="about-container">
            <h2 className="section-title">{t('aboutPage.stats.title')}</h2>
            <div className="about-stats-grid">
              <div className="about-stat-card">
                <div className="about-stat-number">{stats.totalUsers}</div>
                <div className="about-stat-label">{t('aboutPage.stats.users')}</div>
              </div>
              <div className="about-stat-card">
                <div className="about-stat-number">{stats.totalReviews}</div>
                <div className="about-stat-label">{t('aboutPage.stats.reviews')}</div>
              </div>
              <div className="about-stat-card">
                <div className="about-stat-number">{stats.totalCountries}</div>
                <div className="about-stat-label">{t('aboutPage.stats.countries')}</div>
              </div>
              <div className="about-stat-card">
                <div className="about-stat-number">{stats.totalPhotos}</div>
                <div className="about-stat-label">{t('aboutPage.stats.photos')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mission Section */}
      <div className="section">
        <div className="about-container">
          <div className="content-card">
            <h2 className="section-title">{t('aboutPage.mission.title')}</h2>
            <p>
              {t('aboutPage.mission.description')}
            </p>
            <div className="about-features-list">
              <div className="about-feature-item">
                <span className="about-feature-icon">🗺️</span>
                <span>{t('aboutPage.mission.features.maps')}</span>
              </div>
              <div className="about-feature-item">
                <span className="about-feature-icon">📸</span>
                <span>{t('aboutPage.mission.features.photos')}</span>
              </div>
              <div className="about-feature-item">
                <span className="about-feature-icon">⭐</span>
                <span>{t('aboutPage.mission.features.ratings')}</span>
              </div>
              <div className="about-feature-item">
                <span className="about-feature-icon">🌍</span>
                <span>{t('aboutPage.mission.features.community')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      {team.length > 0 && (
        <div className="about-team-section">
          <div className="about-container">
            <h2>{t('aboutPage.team.title')}</h2>
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
          <h2>{t('aboutPage.contact.title')}</h2>
          <div className="about-contact-content">
            <div className="about-contact-info">
              <h3>{t('aboutPage.contact.subtitle')}</h3>
              <p>{t('aboutPage.contact.description')}</p>
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
                  placeholder={t('aboutPage.contact.form.name')}
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
                  placeholder={t('aboutPage.contact.form.email')}
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
                  placeholder={t('aboutPage.contact.form.message')}
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
                {submitting ? t('aboutPage.contact.form.submitting') : t('aboutPage.contact.form.submit')}
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
  );
};

export default About;