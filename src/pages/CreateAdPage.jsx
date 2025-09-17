import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveMap from '../components/features/InteractiveMap';
import PhotoUpload from '../components/features/PhotoUpload';
import StarRating from '../components/ui/StarRating';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import './CreateAdPage.css';

const CreateAdPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    location: null,
    category: '',
    photos: [],
    shortDescription: '',
    detailedDescription: '',
    overallRating: 0,
    categoryRatings: {
      price: 0,
      cleanliness: 0,
      atmosphere: 0,
      service: 0
    },
    tags: [],
    workingHours: '',
    contacts: '',
    promoCode: '',
    isAnonymous: false,
    acceptPolicy: false
  });
  
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  const totalSteps = 5;
  const maxChars = {
    title: 100,
    shortDescription: 200,
    detailedDescription: 1000
  };

  useEffect(() => {
    // Завантажити чернетку з localStorage
    const savedDraft = localStorage.getItem('adDraft');
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, []);

  useEffect(() => {
    // Автозбереження чернетки
    const timer = setTimeout(() => {
      localStorage.setItem('adDraft', JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = "Назва обов'язкова";
        if (!formData.address.trim()) newErrors.address = "Адреса обов'язкова";
        if (!formData.category) newErrors.category = "Оберіть категорію";
        break;
      case 2:
        if (!formData.location) newErrors.location = "Оберіть локацію на мапі";
        break;
      case 3:
        if (formData.photos.length === 0) newErrors.photos = "Додайте хоча б одне фото";
        break;
      case 4:
        if (!formData.shortDescription.trim()) newErrors.shortDescription = "Короткий опис обов'язковий";
        if (formData.overallRating === 0) newErrors.overallRating = "Поставте загальний рейтинг";
        break;
      case 5:
        if (!formData.acceptPolicy) newErrors.acceptPolicy = "Прийміть політику конфіденційності";
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleTagAdd = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleTagRemove = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    
    try {
      // Симуляція API виклику
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Очистити чернетку
      localStorage.removeItem('adDraft');
      
      // Перенаправити на сторінку успіху
      navigate('/ads/success');
    } catch (error) {
      console.error('Помилка створення оголошення:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2>Основна інформація</h2>
            
            <div className="form-group">
              <label>Назва місця *</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Наприклад: Затишне кафе в центрі"
                  maxLength={maxChars.title}
                  className={errors.title ? 'error' : ''}
                />
                <span className="char-count">
                  {formData.title.length}/{maxChars.title}
                </span>
              </div>
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label>Адреса *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="вул. Хрещатик, 22, Київ"
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            <div className="form-group">
              <label>Категорія *</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={errors.category ? 'error' : ''}
              >
                <option value="">Оберіть категорію</option>
                <option value="cafe">☕ Кафе</option>
                <option value="restaurant">🍽️ Ресторан</option>
                <option value="park">🌳 Парк</option>
                <option value="museum">🏛️ Музей</option>
                <option value="shop">🛍️ Магазин</option>
                <option value="hotel">🏨 Готель</option>
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2>Розташування на мапі</h2>
            <p>Оберіть точне розташування вашого місця на мапі</p>
            
            <InteractiveMap
              address={formData.address}
              onLocationSelect={(location) => handleInputChange('location', location)}
              selectedLocation={formData.location}
            />
            
            {errors.location && <span className="error-message">{errors.location}</span>}
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2>Фотографії</h2>
            <p>Додайте фото, щоб показати ваше місце з найкращого боку</p>
            
            <PhotoUpload
              photos={formData.photos}
              onPhotosChange={(photos) => handleInputChange('photos', photos)}
              maxPhotos={10}
            />
            
            {errors.photos && <span className="error-message">{errors.photos}</span>}
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2>Опис та рейтинг</h2>
            
            <div className="form-group">
              <label>Короткий опис *</label>
              <div className="input-wrapper">
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Коротко опишіть ваше місце..."
                  maxLength={maxChars.shortDescription}
                  rows={3}
                  className={errors.shortDescription ? 'error' : ''}
                />
                <span className="char-count">
                  {formData.shortDescription.length}/{maxChars.shortDescription}
                </span>
              </div>
              {errors.shortDescription && <span className="error-message">{errors.shortDescription}</span>}
            </div>

            <div className="form-group">
              <label>Детальний опис</label>
              <div className="input-wrapper">
                <textarea
                  value={formData.detailedDescription}
                  onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                  placeholder="Розкажіть більше про ваше місце..."
                  maxLength={maxChars.detailedDescription}
                  rows={5}
                />
                <span className="char-count">
                  {formData.detailedDescription.length}/{maxChars.detailedDescription}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Загальний рейтинг *</label>
              <StarRating
                rating={formData.overallRating}
                onRatingChange={(rating) => handleInputChange('overallRating', rating)}
                size="large"
                interactive={true}
              />
              {errors.overallRating && <span className="error-message">{errors.overallRating}</span>}
            </div>

            <div className="category-ratings">
              <h3>Рейтинг по категоріях</h3>
              {Object.entries(formData.categoryRatings).map(([category, rating]) => (
                <div key={category} className="category-rating">
                  <span className="category-name">{category}</span>
                  <StarRating
                    rating={rating}
                    onRatingChange={(newRating) => 
                      setFormData(prev => ({
                        ...prev,
                        categoryRatings: {
                          ...prev.categoryRatings,
                          [category]: newRating
                        }
                      }))
                    }
                    interactive={true}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h2>Додаткова інформація</h2>
            
            <div className="form-group">
              <label>Теги</label>
              <div className="tags-input">
                <div className="popular-tags">
                  {['Wi-Fi', 'Паркінг', 'Веган-френдлі', 'Романтика', 'Фріланс', 'Kids Friendly'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-btn ${formData.tags.includes(tag) ? 'active' : ''}`}
                      onClick={() => formData.tags.includes(tag) ? handleTagRemove(tag) : handleTagAdd(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Час роботи</label>
              <input
                type="text"
                value={formData.workingHours}
                onChange={(e) => handleInputChange('workingHours', e.target.value)}
                placeholder="Пн-Пт: 08:00-22:00, Сб-Нд: 10:00-20:00"
              />
            </div>

            <div className="form-group">
              <label>Контакти</label>
              <input
                type="text"
                value={formData.contacts}
                onChange={(e) => handleInputChange('contacts', e.target.value)}
                placeholder="+380 XX XXX XX XX"
              />
            </div>

            <div className="form-group">
              <label>Промокод/Акція</label>
              <input
                type="text"
                value={formData.promoCode}
                onChange={(e) => handleInputChange('promoCode', e.target.value)}
                placeholder="Знижка 10% за промокодом WELCOME"
              />
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                />
                Опублікувати анонімно
              </label>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.acceptPolicy}
                  onChange={(e) => handleInputChange('acceptPolicy', e.target.checked)}
                  className={errors.acceptPolicy ? 'error' : ''}
                />
                Я приймаю політику конфіденційності *
              </label>
              {errors.acceptPolicy && <span className="error-message">{errors.acceptPolicy}</span>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="create-ad-page">
      <Breadcrumbs items={[
        { label: 'Головна', link: '/', icon: '🏠' },
        { label: 'Оголошення', link: '/ads', icon: '📋' },
        { label: 'Створити оголошення', icon: '➕' }
      ]} />
      <div className="progress-header">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <span className="progress-text">
          Крок {currentStep} з {totalSteps}
        </span>

      </div>

      <div className="form-container">
        {renderStep()}
      </div>

      <div className="form-actions">
        <div className="left-actions">
          {currentStep > 1 && (
            <button className="btn-secondary" onClick={handlePrev}>
              ← Назад
            </button>
          )}
          <button 
            className="btn-outline"
            onClick={() => setShowPreview(true)}
          >
            👁️ Попередній перегляд
          </button>
        </div>

        <div className="right-actions">
          {currentStep < totalSteps ? (
            <button className="btn-primary" onClick={handleNext}>
              Далі →
            </button>
          ) : (
            <button className="btn-success" onClick={handleSubmit}>
              🚀 Опублікувати
            </button>
          )}
        </div>
      </div>

      {showPreview && (
        <div className="preview-modal">
          <div className="preview-content">
            <div className="preview-header">
              <h3>Попередній перегляд</h3>
              <button onClick={() => setShowPreview(false)}>✕</button>
            </div>
            <div className="preview-body">
              <h2>{formData.title}</h2>
              <p>{formData.address}</p>
              <p>{formData.shortDescription}</p>
              {/* Додати більше елементів попереднього перегляду */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAdPage;