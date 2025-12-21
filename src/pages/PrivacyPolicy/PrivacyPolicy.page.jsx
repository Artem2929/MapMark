import React from "react";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "../../components/ui/Breadcrumbs.jsx";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('header.home'), link: '/' },
    { label: t('footer.legal.privacy') }
  ];

  return (
    <div className="privacy-policy">
      <div className="privacy-container">
        <Breadcrumbs items={breadcrumbItems} />
        <header className="privacy-header">
          <h1 className="privacy-title">{t('privacyPolicy.title')}</h1>
          <p className="privacy-subtitle">{t('privacyPolicy.subtitle')}</p>
          <p className="privacy-date">{t('privacyPolicy.lastUpdated')}: {t('privacyPolicy.date')}</p>
        </header>

        <div className="privacy-content">
          <section className="privacy-section">
            <h2>{t('privacyPolicy.introduction.title')}</h2>
            <p>{t('privacyPolicy.introduction.description')}</p>
          </section>

          <section className="privacy-section">
            <h2>{t('privacyPolicy.dataCollection.title')}</h2>
            <p>{t('privacyPolicy.dataCollection.description')}</p>
            
            <div className="data-types">
              <div className="data-type">
                <h3>{t('privacyPolicy.dataCollection.types.personal.title')}</h3>
                <ul>
                  <li>{t('privacyPolicy.dataCollection.types.personal.items.name')}</li>
                  <li>{t('privacyPolicy.dataCollection.types.personal.items.email')}</li>
                  <li>{t('privacyPolicy.dataCollection.types.personal.items.location')}</li>
                </ul>
              </div>

              <div className="data-type">
                <h3>{t('privacyPolicy.dataCollection.types.usage.title')}</h3>
                <ul>
                  <li>{t('privacyPolicy.dataCollection.types.usage.items.interactions')}</li>
                  <li>{t('privacyPolicy.dataCollection.types.usage.items.preferences')}</li>
                  <li>{t('privacyPolicy.dataCollection.types.usage.items.device')}</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="privacy-section">
            <h2>{t('privacyPolicy.dataUsage.title')}</h2>
            <p>{t('privacyPolicy.dataUsage.description')}</p>
            <ul>
              <li>{t('privacyPolicy.dataUsage.purposes.service')}</li>
              <li>{t('privacyPolicy.dataUsage.purposes.personalization')}</li>
              <li>{t('privacyPolicy.dataUsage.purposes.communication')}</li>
              <li>{t('privacyPolicy.dataUsage.purposes.improvement')}</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>{t('privacyPolicy.dataSharing.title')}</h2>
            <p>{t('privacyPolicy.dataSharing.description')}</p>
            <div className="privacy-highlight">
              <h4>{t('privacyPolicy.dataSharing.exceptions.title')}</h4>
              <ul>
                <li>{t('privacyPolicy.dataSharing.exceptions.legal')}</li>
                <li>{t('privacyPolicy.dataSharing.exceptions.safety')}</li>
                <li>{t('privacyPolicy.dataSharing.exceptions.business')}</li>
              </ul>
            </div>
          </section>

          <section className="privacy-section">
            <h2>{t('privacyPolicy.dataSecurity.title')}</h2>
            <p>{t('privacyPolicy.dataSecurity.description')}</p>
            <div className="privacy-highlight">
              <h4>{t('privacyPolicy.dataSecurity.measures.title')}</h4>
              <ul>
                <li>{t('privacyPolicy.dataSecurity.measures.encryption')}</li>
                <li>{t('privacyPolicy.dataSecurity.measures.access')}</li>
                <li>{t('privacyPolicy.dataSecurity.measures.monitoring')}</li>
              </ul>
            </div>
          </section>

          <section className="privacy-section">
            <h2>{t('privacyPolicy.userRights.title')}</h2>
            <p>{t('privacyPolicy.userRights.description')}</p>
            <ul>
              <li>{t('privacyPolicy.userRights.rights.access')}</li>
              <li>{t('privacyPolicy.userRights.rights.correction')}</li>
              <li>{t('privacyPolicy.userRights.rights.deletion')}</li>
              <li>{t('privacyPolicy.userRights.rights.portability')}</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>{t('privacyPolicy.cookies.title')}</h2>
            <p>{t('privacyPolicy.cookies.description')}</p>
          </section>

          <section className="privacy-section">
            <h2>{t('privacyPolicy.changes.title')}</h2>
            <p>{t('privacyPolicy.changes.description')}</p>
          </section>

          <section className="privacy-section">
            <h2>{t('privacyPolicy.contact.title')}</h2>
            <p>{t('privacyPolicy.contact.description')}</p>
            <div className="contact-info">
              <p><strong>{t('privacyPolicy.contact.email')}:</strong> privacy@mapmark.com</p>
              <p><strong>{t('privacyPolicy.contact.address')}:</strong> {t('privacyPolicy.contact.addressText')}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;