import React, { useState, useEffect } from 'react';
import { classNames } from '../../utils/classNames';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import './SellerProfile.css';

const SellerProfile = () => {
  const { sellerId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sellerType, setSellerType] = useState('products'); // 'products' or 'services'
  const [activeTab, setActiveTab] = useState('products');
  
  // Mock seller data
  const [seller] = useState({
    id: sellerId || 'demo_seller_1',
    name: 'Олександр Коваленко',
    businessName: 'TechStore Ukraine',
    avatar: null,
    rating: 4.8,
    reviewsCount: 127,
    location: 'Київ, Україна',
    joinedAt: '2023-01-15',
    verified: true,
    description: 'Продаємо якісну електроніку та надаємо технічну підтримку. Гарантія на всі товари.',
    stats: {
      totalSales: 1250,
      activeProducts: 45,
      completedOrders: 1180,
      responseTime: '2 години'
    },
    products: [
      {
        id: 1,
        title: 'iPhone 15 Pro Max 256GB',
        price: 45000,
        currency: 'UAH',
        image: 'https://via.placeholder.com/300x200',
        category: 'Електроніка',
        inStock: true,
        views: 234
      },
      {
        id: 2,
        title: 'MacBook Air M2 13"',
        price: 52000,
        currency: 'UAH',
        image: 'https://via.placeholder.com/300x200',
        category: 'Комп\'ютери',
        inStock: true,
        views: 189
      }
    ],
    services: [
      {
        id: 1,
        title: 'Ремонт iPhone та iPad',
        priceFrom: 500,
        currency: 'UAH',
        image: 'https://via.placeholder.com/300x200',
        category: 'Ремонт техніки',
        duration: '1-3 дні',
        rating: 4.9
      },
      {
        id: 2,
        title: 'Встановлення ПЗ на Mac',
        priceFrom: 300,
        currency: 'UAH',
        image: 'https://via.placeholder.com/300x200',
        category: 'IT послуги',
        duration: '1-2 години',
        rating: 4.7
      }
    ]
  });

  const breadcrumbItems = [
    { label: t('header.home'), link: '/' },
    { label: 'Продавці', link: '/sellers' },
    { label: seller.businessName }
  ];

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const getJoinedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="page-container seller-profile">
        <div className="seller-container">
          <Breadcrumbs items={breadcrumbItems} />
          
          {/* Seller Header */}
          <div className="seller-header">
            <div className="seller-avatar-section">
              <div className="seller-avatar">
                {seller.avatar ? (
                  <img src={seller.avatar} alt={seller.name} />
                ) : (
                  <div className="seller-avatar-placeholder">
                    {seller.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {seller.verified && <div className="verified-badge">✓</div>}
              </div>
            </div>
            
            <div className="seller-info">
              <h1 className="seller-business-name">{seller.businessName}</h1>
              <p className="seller-name">Власник: {seller.name}</p>
              
              <div className="seller-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`star ${i < Math.floor(seller.rating) ? 'filled' : ''}`}>
                      ⭐
                    </span>
                  ))}
                  <span className="rating-text">{seller.rating} ({seller.reviewsCount} відгуків)</span>
                </div>
              </div>
              
              <div className="seller-location">📍 {seller.location}</div>
              <div className="seller-joined">Працює з {getJoinedDate(seller.joinedAt)}</div>
              
              <p className="seller-description">{seller.description}</p>
              
              <div className="seller-actions">
                <button className="contact-btn">💬 Написати</button>
                <button className="call-btn">📞 Зателефонувати</button>
                <button className="favorite-btn">❤️ В обране</button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="seller-stats">
            <div className="stat-item">
              <div className="stat-number">{seller.stats.totalSales}</div>
              <div className="stat-label">Продажів</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{seller.stats.activeProducts}</div>
              <div className="stat-label">Активних товарів</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{seller.stats.completedOrders}</div>
              <div className="stat-label">Виконаних замовлень</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{seller.stats.responseTime}</div>
              <div className="stat-label">Час відповіді</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="seller-tabs">
            <button 
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={useCallback(() => setActiveTab('products'), [])}
            >
              🛍️ Товари ({seller.products.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
              onClick={useCallback(() => setActiveTab('services'), [])}
            >
              🔧 Послуги ({seller.services.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={useCallback(() => setActiveTab('reviews'), [])}
            >
              ⭐ Відгуки ({seller.reviewsCount})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
              onClick={useCallback(() => setActiveTab('about'), [])}
            >
              ℹ️ Про продавця
            </button>
          </div>

          {/* Content */}
          <div className="seller-content">
            {activeTab === 'products' && (
              <div className="products-grid">
                {seller.products.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      <img src={product.image} alt={product.title} />
                      <div className="product-category">{product.category}</div>
                    </div>
                    <div className="product-info">
                      <h3 className="product-title">{product.title}</h3>
                      <div className="product-price">{formatPrice(product.price, product.currency)}</div>
                      <div className="product-meta">
                        <span className={`stock-status ${product.inStock ? 'in-stock' : 'out-stock'}`}>
                          {product.inStock ? '✅ В наявності' : '❌ Немає в наявності'}
                        </span>
                        <span className="product-views">👁️ {product.views}</span>
                      </div>
                      <button className="product-btn">Переглянути</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'services' && (
              <div className="services-grid">
                {seller.services.map(service => (
                  <div key={service.id} className="service-card">
                    <div className="service-image">
                      <img src={service.image} alt={service.title} />
                      <div className="service-category">{service.category}</div>
                    </div>
                    <div className="service-info">
                      <h3 className="service-title">{service.title}</h3>
                      <div className="service-price">Від {formatPrice(service.priceFrom, service.currency)}</div>
                      <div className="service-meta">
                        <span className="service-duration">⏱️ {service.duration}</span>
                        <span className="service-rating">⭐ {service.rating}</span>
                      </div>
                      <button className="service-btn">Замовити</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-section">
                <div className="reviews-empty">
                  <div>⭐</div>
                  <h3>Відгуки завантажуються...</h3>
                  <p>Тут будуть відображатися відгуки клієнтів</p>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="about-section">
                <h3>Про продавця</h3>
                <p>{seller.description}</p>
                <div className="about-details">
                  <div className="detail-item">
                    <strong>Місцезнаходження:</strong> {seller.location}
                  </div>
                  <div className="detail-item">
                    <strong>Працює з:</strong> {getJoinedDate(seller.joinedAt)}
                  </div>
                  <div className="detail-item">
                    <strong>Верифікований:</strong> {seller.verified ? 'Так ✓' : 'Ні'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
};

export default SellerProfile;