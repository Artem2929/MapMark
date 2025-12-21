import React from "react";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "../../components/ui/Breadcrumbs.jsx";
import "./ContactUs.css";

const ContactUs = () => {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('header.home'), link: '/' },
    { label: t('footer.support.contact') }
  ];

  return (
    <div className="contact-us">
      <div className="contact-container">
        <Breadcrumbs items={breadcrumbItems} />
        <header className="contact-header">
          <h1 className="contact-title">{t('contactUs.title')}</h1>
          <p className="contact-subtitle">{t('contactUs.subtitle')}</p>
        </header>

        <div className="contact-content">
          <section className="contact-section">
            <p>{t('contactUs.description')}</p>
            <div className="contact-info">
              <p><strong>{t('contactUs.email')}:</strong> contact@mapmark.com</p>
              <p><strong>{t('contactUs.response')}:</strong> {t('contactUs.responseTime')}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;