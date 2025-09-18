import React from "react";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import Footer from "../components/layout/Footer.jsx";
import "./DiscoverPlaces.css";

const DiscoverPlaces = () => {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('header.home'), link: '/' },
    { label: t('header.discover') }
  ];

  return (
    <div className="discover-places">
      <div className="discover-container">
        <Breadcrumbs items={breadcrumbItems} />
        <header className="discover-header">
          <h1 className="discover-title">{t('discoverPlaces.title')}</h1>
          <p className="discover-subtitle">{t('discoverPlaces.subtitle')}</p>
        </header>

        <div className="photo-feed">
          <div className="feed-item">
            <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop" alt="Mountain landscape" />
            <div className="feed-content">
              <h3>Swiss Alps, Switzerland</h3>
              <p>"Breathtaking views and perfect hiking trails. The cable car ride to the summit was incredible!"</p>
              <div className="feed-meta">
                <span className="rating">⭐ 4.8 (127 reviews)</span>
                <span className="location">📍 46.5197° N, 7.4815° E</span>
              </div>
            </div>
          </div>
          
          <div className="feed-item">
            <img src="https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=600&h=400&fit=crop" alt="Beach sunset" />
            <div className="feed-content">
              <h3>Maldives Beach Resort</h3>
              <p>"Crystal clear waters and white sand beaches. Perfect for snorkeling and relaxation. The sunset views are magical!"</p>
              <div className="feed-meta">
                <span className="rating">⭐ 4.9 (89 reviews)</span>
                <span className="location">📍 3.2028° N, 73.2207° E</span>
              </div>
            </div>
          </div>
          
          <div className="feed-item">
            <img src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop" alt="City architecture" />
            <div className="feed-content">
              <h3>Eiffel Tower, Paris</h3>
              <p>"Iconic landmark with stunning city views. Best visited at sunset. The nearby cafes are charming too!"</p>
              <div className="feed-meta">
                <span className="rating">⭐ 4.7 (2,341 reviews)</span>
                <span className="location">📍 48.8584° N, 2.2945° E</span>
              </div>
            </div>
          </div>
          
          <div className="feed-item">
            <img src="https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&h=400&fit=crop" alt="Santorini" />
            <div className="feed-content">
              <h3>Santorini, Greece</h3>
              <p>"Blue domed churches and stunning sunsets. The local wine and seafood are exceptional. A must-visit destination!"</p>
              <div className="feed-meta">
                <span className="rating">⭐ 4.9 (456 reviews)</span>
                <span className="location">📍 36.3932° N, 25.4615° E</span>
              </div>
            </div>
          </div>
          
          <div className="feed-item">
            <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop" alt="Lake view" />
            <div className="feed-content">
              <h3>Lake Bled, Slovenia</h3>
              <p>"Fairy-tale castle and emerald lake. Perfect for rowing to the island church. The cream cake is legendary!"</p>
              <div className="feed-meta">
                <span className="rating">⭐ 4.8 (234 reviews)</span>
                <span className="location">📍 46.3683° N, 14.1147° E</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DiscoverPlaces;