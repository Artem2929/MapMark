import React from "react";
import { useTranslation } from "react-i18next";
import "./Footer.css";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section footer-brand">
            <div className="brand-logo">
              <h3 className="footer-title">PinPoint</h3>
            </div>
            <p className="footer-description">{t('footer.description')}</p>

          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">{t('footer.explore.title')}</h4>
            <ul className="footer-links">
              <li><a href="/" className="footer-link">{t('header.home')}</a></li>
              <li><a href="/listings" className="footer-link">{t('header.listings')}</a></li>
              <li><a href="/about" className="footer-link">{t('header.about')}</a></li>
              <li><a href="/discover-places" className="footer-link">{t('footer.explore.discover')}</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">{t('footer.support.title')}</h4>
            <ul className="footer-links">
              <li><a href="/help-center" className="footer-link">{t('footer.support.help')}</a></li>
              <li><a href="/contact-us" className="footer-link">{t('footer.support.contact')}</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">{t('footer.legal.title')}</h4>
            <ul className="footer-links">
              <li><a href="/privacy-policy" className="footer-link">{t('footer.legal.privacy')}</a></li>
              <li><a href="/terms-of-service" className="footer-link">{t('footer.legal.terms')}</a></li>
              <li><a href="/cookie-policy" className="footer-link">{t('footer.legal.cookies')}</a></li>
            </ul>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;