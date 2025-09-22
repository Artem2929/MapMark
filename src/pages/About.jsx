import React from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../components/layout/Footer';
import './About.css';

const About = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language === 'uk' ? 'ua' : 'en';

  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="hero-content">
          <h1 className="hero-title">{t(`aboutPage.${currentLang}.title`)}</h1>
          {t(`aboutPage.${currentLang}.description`)}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;