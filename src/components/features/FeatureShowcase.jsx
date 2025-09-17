import React, { useState } from 'react';
import './FeatureShowcase.css';

const FeatureShowcase = ({ isOpen, onClose }) => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: 'voice',
      title: '🎤 Голосові відгуки',
      description: 'Залишайте відгуки голосом з AI-аналізом тональності',
      benefits: [
        'Розпізнавання мови в реальному часі',
        'Автоматична оцінка на основі тональності',
        'Аудіо-візуалізація під час запису',
        'Виділення ключових слів'
      ],
      demo: '🎙️ "Чудове кафе з неймовірною атмосферою!" → ⭐⭐⭐⭐⭐'
    },
    {
      id: 'ar',
      title: '📱 AR-камера',
      description: 'Дивіться на світ через доповнену реальність',
      benefits: [
        'AR-маркери для місць поблизу',
        'Компас та орієнтація пристрою',
        'AR-фото з геолокаційними мітками',
        'Відстань до об\'єктів в реальному часі'
      ],
      demo: '📍 Кафе "Львівська кава" - 150м → 📸 AR-фото'
    },
    {
      id: 'filters',
      title: '🎯 Розумні фільтри',
      description: 'AI-рекомендації на основі вашого настрою та часу',
      benefits: [
        'Персоналізовані рекомендації',
        'Фільтрація за настроєм',
        'Геолокаційні фільтри',
        'Фільтри доступності'
      ],
      demo: '🌅 Ранок + ☕ Настрій → Рекомендації: Кафе, Пекарня'
    },
    {
      id: 'gamification',
      title: '🏆 Гейміфікація',
      description: 'Збирайте бейджі, підвищуйте рівень, змагайтесь з друзями',
      benefits: [
        '15+ унікальних бейджів',
        '6 рівнів прогресу',
        'Щоденні серії активності',
        'Рейтинг користувачів'
      ],
      demo: '📝 10 відгуків → 🏆 Бейдж "Рецензент" + 50 балів'
    },
    {
      id: 'social',
      title: '📱 Соціальна стрічка',
      description: 'Слідкуйте за активністю друзів та діліться досвідом',
      benefits: [
        'Стрічка активності друзів',
        'Лайки та коментарі',
        'Поділитися відгуками',
        'Групові активності'
      ],
      demo: '👥 Олена залишила відгук → 💬 Коментувати → ❤️ Лайк'
    },
    {
      id: 'analytics',
      title: '📊 Аналітика',
      description: 'Дізнавайтесь більше про свої уподобання та звички',
      benefits: [
        'Персональні інсайти',
        'Патерни поведінки',
        'Статистика активності',
        'Експорт даних'
      ],
      demo: '📈 25 місць → ❤️ Улюблена категорія: Кафе → 🕐 Активність: 14:00'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="showcase-overlay">
      <div className="showcase-container">
        <div className="showcase-header">
          <h2>✨ Інноваційні функції MapMark</h2>
          <button className="showcase-close" onClick={onClose}>✕</button>
        </div>

        <div className="showcase-content">
          <div className="features-nav">
            {features.map((feature, index) => (
              <button
                key={feature.id}
                className={`feature-nav-btn ${activeFeature === index ? 'active' : ''}`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="nav-icon">{feature.title.split(' ')[0]}</div>
                <div className="nav-title">{feature.title.split(' ').slice(1).join(' ')}</div>
              </button>
            ))}
          </div>

          <div className="feature-details">
            <div className="feature-main">
              <h3>{features[activeFeature].title}</h3>
              <p className="feature-description">
                {features[activeFeature].description}
              </p>

              <div className="feature-demo">
                <h4>💡 Приклад використання:</h4>
                <div className="demo-text">
                  {features[activeFeature].demo}
                </div>
              </div>

              <div className="feature-benefits">
                <h4>🚀 Переваги:</h4>
                <ul>
                  {features[activeFeature].benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="feature-visual">
              <div className="visual-placeholder">
                <div className="visual-icon">
                  {features[activeFeature].title.split(' ')[0]}
                </div>
                <div className="visual-text">
                  {features[activeFeature].title}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="showcase-footer">
          <div className="progress-indicator">
            {features.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${activeFeature === index ? 'active' : ''}`}
                onClick={() => setActiveFeature(index)}
              />
            ))}
          </div>

          <div className="showcase-actions">
            <button
              className="nav-btn prev-btn"
              onClick={() => setActiveFeature(Math.max(0, activeFeature - 1))}
              disabled={activeFeature === 0}
            >
              ← Попередня
            </button>
            
            <button className="try-btn">
              Спробувати зараз
            </button>
            
            <button
              className="nav-btn next-btn"
              onClick={() => setActiveFeature(Math.min(features.length - 1, activeFeature + 1))}
              disabled={activeFeature === features.length - 1}
            >
              Наступна →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;