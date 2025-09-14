import React from 'react';
import { useTranslation } from 'react-i18next';
import './About.css';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="hero-content">
          <div className="hero-icon">🗺️</div>
          <h1 className="hero-title">{t('about.title')}</h1>
          <p className="hero-subtitle">{t('about.subtitle')}</p>
        </div>
      </div>

      <div className="about-container">
        <div className="about-section">
          <div className="section-header">
            <div className="section-icon">🌍</div>
            <h2>{t('about.mission.title')}</h2>
          </div>
          <p>{t('about.mission.description')}</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>{t('about.features.discover.title')}</h3>
            <p>{t('about.features.discover.description')}</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>{t('about.features.review.title')}</h3>
            <p>{t('about.features.review.description')}</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>{t('about.features.global.title')}</h3>
            <p>{t('about.features.global.description')}</p>
          </div>
        </div>

        <div className="about-section">
          <div className="section-header">
            <div className="section-icon">🚀</div>
            <h2>{t('about.vision.title')}</h2>
          </div>
          <p>{t('about.vision.description')}</p>
        </div>

        <div className="stats-section">
          <div className="stat-item">
            <div className="stat-number">12</div>
            <div className="stat-label">{t('about.stats.languages')}</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">∞</div>
            <div className="stat-label">{t('about.stats.locations')}</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">{t('about.stats.available')}</div>
          </div>
        </div>

        <div className="cta-section">
          <h2>{t('about.cta.title')}</h2>
          <p>{t('about.cta.description')}</p>
          <button className="cta-button" onClick={() => window.location.href = '/'}>
            {t('about.cta.button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;