import React from "react";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "../../components/ui/Breadcrumbs.jsx";
import "./TermsOfService.css";

const TermsOfService = () => {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('header.home'), link: '/' },
    { label: t('footer.legal.terms') }
  ];

  return (
    <div className="terms-of-service">
      <div className="terms-container">
        <Breadcrumbs items={breadcrumbItems} />
        <header className="terms-header">
          <h1 className="terms-title">{t('termsOfService.title')}</h1>
          <p className="terms-subtitle">{t('termsOfService.subtitle')}</p>
          <p className="terms-date">{t('termsOfService.lastUpdated')}: {t('termsOfService.date')}</p>
        </header>

        <div className="terms-content">
          <section className="terms-section">
            <h2>{t('termsOfService.acceptance.title')}</h2>
            <p>{t('termsOfService.acceptance.description')}</p>
          </section>

          <section className="terms-section">
            <h2>{t('termsOfService.services.title')}</h2>
            <p>{t('termsOfService.services.description')}</p>
            <ul>
              <li>{t('termsOfService.services.features.map')}</li>
              <li>{t('termsOfService.services.features.reviews')}</li>
              <li>{t('termsOfService.services.features.community')}</li>
              <li>{t('termsOfService.services.features.recommendations')}</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>{t('termsOfService.userAccount.title')}</h2>
            <p>{t('termsOfService.userAccount.description')}</p>
            <div className="terms-highlight">
              <h4>{t('termsOfService.userAccount.responsibilities.title')}</h4>
              <ul>
                <li>{t('termsOfService.userAccount.responsibilities.accurate')}</li>
                <li>{t('termsOfService.userAccount.responsibilities.security')}</li>
                <li>{t('termsOfService.userAccount.responsibilities.activities')}</li>
              </ul>
            </div>
          </section>

          <section className="terms-section">
            <h2>{t('termsOfService.userContent.title')}</h2>
            <p>{t('termsOfService.userContent.description')}</p>
            <div className="terms-highlight">
              <h4>{t('termsOfService.userContent.prohibited.title')}</h4>
              <ul>
                <li>{t('termsOfService.userContent.prohibited.illegal')}</li>
                <li>{t('termsOfService.userContent.prohibited.harmful')}</li>
                <li>{t('termsOfService.userContent.prohibited.spam')}</li>
                <li>{t('termsOfService.userContent.prohibited.copyright')}</li>
              </ul>
            </div>
          </section>

          <section className="terms-section">
            <h2>{t('termsOfService.privacy.title')}</h2>
            <p>{t('termsOfService.privacy.description')}</p>
          </section>

          <section className="terms-section">
            <h2>{t('termsOfService.termination.title')}</h2>
            <p>{t('termsOfService.termination.description')}</p>
          </section>

          <section className="terms-section">
            <h2>{t('termsOfService.limitation.title')}</h2>
            <p>{t('termsOfService.limitation.description')}</p>
          </section>

          <section className="terms-section">
            <h2>{t('termsOfService.changes.title')}</h2>
            <p>{t('termsOfService.changes.description')}</p>
          </section>

          <section className="terms-section">
            <h2>{t('termsOfService.contact.title')}</h2>
            <p>{t('termsOfService.contact.description')}</p>
            <div className="contact-info">
              <p><strong>{t('termsOfService.contact.email')}:</strong> legal@pinpoint.com</p>
              <p><strong>{t('termsOfService.contact.address')}:</strong> {t('termsOfService.contact.addressText')}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;