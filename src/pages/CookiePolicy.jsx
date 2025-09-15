import React from "react";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import Footer from "../components/layout/Footer.jsx";
import "./CookiePolicy.css";

const CookiePolicy = () => {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('header.home'), link: '/' },
    { label: t('footer.legal.cookies') }
  ];

  return (
    <div className="cookie-policy">
      <div className="cookie-policy-container">
        <Breadcrumbs items={breadcrumbItems} />
        <header className="cookie-policy-header">
          <h1 className="cookie-policy-title">{t('cookiePolicy.title')}</h1>
          <p className="cookie-policy-subtitle">{t('cookiePolicy.subtitle')}</p>
          <p className="cookie-policy-date">{t('cookiePolicy.lastUpdated')}: {t('cookiePolicy.date')}</p>
        </header>

        <div className="cookie-policy-content">
          <section className="cookie-section">
            <h2>{t('cookiePolicy.whatAreCookies.title')}</h2>
            <p>{t('cookiePolicy.whatAreCookies.description')}</p>
          </section>

          <section className="cookie-section">
            <h2>{t('cookiePolicy.howWeUseCookies.title')}</h2>
            <p>{t('cookiePolicy.howWeUseCookies.description')}</p>
            
            <div className="cookie-types">
              <div className="cookie-type">
                <h3>{t('cookiePolicy.cookieTypes.essential.title')}</h3>
                <p>{t('cookiePolicy.cookieTypes.essential.description')}</p>
                <ul>
                  <li>{t('cookiePolicy.cookieTypes.essential.examples.authentication')}</li>
                  <li>{t('cookiePolicy.cookieTypes.essential.examples.security')}</li>
                  <li>{t('cookiePolicy.cookieTypes.essential.examples.preferences')}</li>
                </ul>
              </div>

              <div className="cookie-type">
                <h3>{t('cookiePolicy.cookieTypes.functional.title')}</h3>
                <p>{t('cookiePolicy.cookieTypes.functional.description')}</p>
                <ul>
                  <li>{t('cookiePolicy.cookieTypes.functional.examples.language')}</li>
                  <li>{t('cookiePolicy.cookieTypes.functional.examples.location')}</li>
                  <li>{t('cookiePolicy.cookieTypes.functional.examples.mapSettings')}</li>
                </ul>
              </div>

              <div className="cookie-type">
                <h3>{t('cookiePolicy.cookieTypes.analytics.title')}</h3>
                <p>{t('cookiePolicy.cookieTypes.analytics.description')}</p>
                <ul>
                  <li>{t('cookiePolicy.cookieTypes.analytics.examples.usage')}</li>
                  <li>{t('cookiePolicy.cookieTypes.analytics.examples.performance')}</li>
                  <li>{t('cookiePolicy.cookieTypes.analytics.examples.errors')}</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="cookie-section">
            <h2>{t('cookiePolicy.thirdParty.title')}</h2>
            <p>{t('cookiePolicy.thirdParty.description')}</p>
            <div className="third-party-services">
              <div className="service">
                <h4>{t('cookiePolicy.thirdParty.services.maps.title')}</h4>
                <p>{t('cookiePolicy.thirdParty.services.maps.description')}</p>
              </div>
              <div className="service">
                <h4>{t('cookiePolicy.thirdParty.services.analytics.title')}</h4>
                <p>{t('cookiePolicy.thirdParty.services.analytics.description')}</p>
              </div>
            </div>
          </section>

          <section className="cookie-section">
            <h2>{t('cookiePolicy.manageCookies.title')}</h2>
            <p>{t('cookiePolicy.manageCookies.description')}</p>
            <div className="browser-instructions">
              <h4>{t('cookiePolicy.manageCookies.browserSettings')}</h4>
              <ul>
                <li><strong>Chrome:</strong> {t('cookiePolicy.manageCookies.browsers.chrome')}</li>
                <li><strong>Firefox:</strong> {t('cookiePolicy.manageCookies.browsers.firefox')}</li>
                <li><strong>Safari:</strong> {t('cookiePolicy.manageCookies.browsers.safari')}</li>
                <li><strong>Edge:</strong> {t('cookiePolicy.manageCookies.browsers.edge')}</li>
              </ul>
            </div>
          </section>

          <section className="cookie-section">
            <h2>{t('cookiePolicy.consent.title')}</h2>
            <p>{t('cookiePolicy.consent.description')}</p>
            <p>{t('cookiePolicy.consent.withdrawal')}</p>
          </section>

          <section className="cookie-section">
            <h2>{t('cookiePolicy.contact.title')}</h2>
            <p>{t('cookiePolicy.contact.description')}</p>
            <div className="contact-info">
              <p><strong>{t('cookiePolicy.contact.email')}:</strong> privacy@mapmark.com</p>
              <p><strong>{t('cookiePolicy.contact.address')}:</strong> {t('cookiePolicy.contact.addressText')}</p>
            </div>
          </section>

          <section className="cookie-section">
            <h2>{t('cookiePolicy.changes.title')}</h2>
            <p>{t('cookiePolicy.changes.description')}</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CookiePolicy;