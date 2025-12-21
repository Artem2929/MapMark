import React from "react";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import "./HelpCenter.css";

const HelpCenter = () => {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('header.home'), link: '/' },
    { label: t('footer.support.help') }
  ];

  return (
    <div className="help-center">
      <div className="help-container">
        <Breadcrumbs items={breadcrumbItems} />
        <header className="help-header">
          <h1 className="help-title">{t('helpCenter.title')}</h1>
          <p className="help-subtitle">{t('helpCenter.subtitle')}</p>
        </header>

        <div className="help-content">
          <section className="help-section">
            <h2>{t('helpCenter.gettingStarted.title')}</h2>
            <p>{t('helpCenter.gettingStarted.description')}</p>
            
            <div className="help-steps">
              <div className="help-step">
                <h3>1. {t('helpCenter.gettingStarted.steps.explore.title')}</h3>
                <p>{t('helpCenter.gettingStarted.steps.explore.description')}</p>
              </div>
              <div className="help-step">
                <h3>2. {t('helpCenter.gettingStarted.steps.click.title')}</h3>
                <p>{t('helpCenter.gettingStarted.steps.click.description')}</p>
              </div>
              <div className="help-step">
                <h3>3. {t('helpCenter.gettingStarted.steps.review.title')}</h3>
                <p>{t('helpCenter.gettingStarted.steps.review.description')}</p>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h2>{t('helpCenter.features.title')}</h2>
            
            <div className="feature-grid">
              <div className="feature-item">
                <h3>{t('helpCenter.features.map.title')}</h3>
                <p>{t('helpCenter.features.map.description')}</p>
              </div>
              <div className="feature-item">
                <h3>{t('helpCenter.features.reviews.title')}</h3>
                <p>{t('helpCenter.features.reviews.description')}</p>
              </div>
              <div className="feature-item">
                <h3>{t('helpCenter.features.filters.title')}</h3>
                <p>{t('helpCenter.features.filters.description')}</p>
              </div>
              <div className="feature-item">
                <h3>{t('helpCenter.features.languages.title')}</h3>
                <p>{t('helpCenter.features.languages.description')}</p>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h2>{t('helpCenter.howToUse.title')}</h2>
            
            <div className="usage-guide">
              <div className="usage-item">
                <h4>{t('helpCenter.howToUse.addReview.title')}</h4>
                <ol>
                  <li>{t('helpCenter.howToUse.addReview.steps.find')}</li>
                  <li>{t('helpCenter.howToUse.addReview.steps.click')}</li>
                  <li>{t('helpCenter.howToUse.addReview.steps.write')}</li>
                  <li>{t('helpCenter.howToUse.addReview.steps.rate')}</li>
                  <li>{t('helpCenter.howToUse.addReview.steps.publish')}</li>
                </ol>
              </div>

              <div className="usage-item">
                <h4>{t('helpCenter.howToUse.navigation.title')}</h4>
                <ul>
                  <li>{t('helpCenter.howToUse.navigation.zoom')}</li>
                  <li>{t('helpCenter.howToUse.navigation.drag')}</li>
                  <li>{t('helpCenter.howToUse.navigation.search')}</li>
                  <li>{t('helpCenter.howToUse.navigation.filters')}</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h2>{t('helpCenter.faq.title')}</h2>
            
            <div className="faq-list">
              <div className="faq-item">
                <h4>{t('helpCenter.faq.items.account.question')}</h4>
                <p>{t('helpCenter.faq.items.account.answer')}</p>
              </div>
              <div className="faq-item">
                <h4>{t('helpCenter.faq.items.reviews.question')}</h4>
                <p>{t('helpCenter.faq.items.reviews.answer')}</p>
              </div>
              <div className="faq-item">
                <h4>{t('helpCenter.faq.items.languages.question')}</h4>
                <p>{t('helpCenter.faq.items.languages.answer')}</p>
              </div>
              <div className="faq-item">
                <h4>{t('helpCenter.faq.items.mobile.question')}</h4>
                <p>{t('helpCenter.faq.items.mobile.answer')}</p>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h2>{t('helpCenter.contact.title')}</h2>
            <p>{t('helpCenter.contact.description')}</p>
            <div className="contact-info">
              <p><strong>{t('helpCenter.contact.email')}:</strong> support@mapmark.com</p>
              <p><strong>{t('helpCenter.contact.response')}:</strong> {t('helpCenter.contact.responseTime')}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;