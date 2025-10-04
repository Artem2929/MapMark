import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../ui/CustomSelect';
import { validateCreateAdForm } from '../../utils/createAdValidation';
import './CreateAdForm.css';

const CreateAdForm = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    country: '',
    city: '',
    address: '',
    details: '',
    price: '',
    currency: 'USD',
    contactPhone: '',
    contactEmail: '',
    photos: []
  });
  const [errors, setErrors] = useState({});

  const categories = [
    { value: '', label: i18n.language.includes('uk') ? 'Оберіть категорію' : 'Select category' },
    { value: 'realty', label: `🏠 ${i18n.language.includes('uk') ? 'Нерухомість' : 'Real Estate'}` },
    { value: 'transport', label: `🚗 ${i18n.language.includes('uk') ? 'Транспорт' : 'Transport'}` },
    { value: 'work', label: `💼 ${i18n.language.includes('uk') ? 'Робота' : 'Work'}` },
    { value: 'services', label: `🔧 ${i18n.language.includes('uk') ? 'Послуги' : 'Services'}` },
    { value: 'electronics', label: `📱 ${i18n.language.includes('uk') ? 'Електроніка' : 'Electronics'}` },
    { value: 'places', label: `🍽️ ${i18n.language.includes('uk') ? 'Заклади' : 'Places'}` },
    { value: 'entertainment', label: `🎯 ${i18n.language.includes('uk') ? 'Розваги' : 'Entertainment'}` }
  ];

  const getSubcategories = () => {
    const subcategories = [
      { value: '', label: i18n.language.includes('uk') ? 'Оберіть підкатегорію' : 'Select subcategory' }
    ];

    if (formData.category === 'realty') {
      subcategories.push(
        { value: 'apartments', label: `🏢 ${i18n.language.includes('uk') ? 'Квартири' : 'Apartments'}` },
        { value: 'houses', label: `🏡 ${i18n.language.includes('uk') ? 'Будинки' : 'Houses'}` },
        { value: 'commercial', label: `🏬 ${i18n.language.includes('uk') ? 'Комерційна' : 'Commercial'}` },
        { value: 'land', label: `🌾 ${i18n.language.includes('uk') ? 'Земля' : 'Land'}` }
      );
    } else if (formData.category === 'transport') {
      subcategories.push(
        { value: 'cars', label: `🚙 ${i18n.language.includes('uk') ? 'Авто' : 'Cars'}` },
        { value: 'motorcycles', label: `🏍️ ${i18n.language.includes('uk') ? 'Мото' : 'Motorcycles'}` },
        { value: 'trucks', label: `🚛 ${i18n.language.includes('uk') ? 'Вантажівки' : 'Trucks'}` },
        { value: 'boats', label: `⛵ ${i18n.language.includes('uk') ? 'Водний' : 'Boats'}` }
      );
    } else if (formData.category === 'work') {
      subcategories.push(
        { value: 'vacancies', label: `📋 ${i18n.language.includes('uk') ? 'Вакансії' : 'Vacancies'}` },
        { value: 'resumes', label: `📄 ${i18n.language.includes('uk') ? 'Резюме' : 'Resumes'}` },
        { value: 'freelance', label: `💻 ${i18n.language.includes('uk') ? 'Фріланс' : 'Freelance'}` }
      );
    } else if (formData.category === 'services') {
      subcategories.push(
        { value: 'construction', label: `🔨 ${i18n.language.includes('uk') ? 'Будівельні' : 'Construction'}` },
        { value: 'household', label: `🏠 ${i18n.language.includes('uk') ? 'Побутові' : 'Household'}` },
        { value: 'education', label: `📚 ${i18n.language.includes('uk') ? 'Освіта' : 'Education'}` },
        { value: 'beauty', label: `💄 ${i18n.language.includes('uk') ? 'Краса' : 'Beauty'}` }
      );
    } else if (formData.category === 'electronics') {
      subcategories.push(
        { value: 'smartphones', label: `📱 ${i18n.language.includes('uk') ? 'Телефони' : 'Smartphones'}` },
        { value: 'computers', label: `💻 ${i18n.language.includes('uk') ? 'Комп\'ютери' : 'Computers'}` },
        { value: 'appliances', label: `🔌 ${i18n.language.includes('uk') ? 'Техніка' : 'Appliances'}` }
      );
    } else if (formData.category === 'places') {
      subcategories.push(
        { value: 'cafe', label: `☕ ${i18n.language.includes('uk') ? 'Кафе' : 'Cafe'}` },
        { value: 'restaurant', label: `🍽️ ${i18n.language.includes('uk') ? 'Ресторани' : 'Restaurants'}` },
        { value: 'hotel', label: `🏨 ${i18n.language.includes('uk') ? 'Готелі' : 'Hotels'}` }
      );
    } else if (formData.category === 'entertainment') {
      subcategories.push(
        { value: 'park', label: `🌳 ${i18n.language.includes('uk') ? 'Парки' : 'Parks'}` },
        { value: 'museum', label: `🏛️ ${i18n.language.includes('uk') ? 'Музеї' : 'Museums'}` },
        { value: 'shop', label: `🛍️ ${i18n.language.includes('uk') ? 'Магазини' : 'Shops'}` }
      );
    }

    return subcategories;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      ...(field === 'category' ? { subcategory: '' } : {}),
      ...(field === 'country' ? { city: '' } : {})
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    
    // Auto-save to localStorage
    const updatedData = { ...formData, [field]: value };
    localStorage.setItem('createAdFormData', JSON.stringify(updatedData));
  };

  // Load saved data on component mount
  React.useEffect(() => {
    const savedData = localStorage.getItem('createAdFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsedData, photos: [] })); // Don't restore photos
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  // Clear saved data when form is submitted successfully
  React.useEffect(() => {
    if (currentStep === 3) {
      localStorage.removeItem('createAdFormData');
    }
  }, [currentStep]);

  const validateStep1 = () => {
    const validation = validateCreateAdForm(formData, 1, i18n);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const validateStep2 = () => {
    const validation = validateCreateAdForm(formData, 2, i18n);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleNext = async () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setIsSubmitting(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Form submitted:', formData);
        setCurrentStep(3);
      } catch (error) {
        console.error('Submission error:', error);
        setErrors({ submit: i18n.language.includes('uk') ? 'Помилка при створенні оголошення' : 'Error creating ad' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file count
    if (files.length + formData.photos.length > 5) {
      setErrors(prev => ({ ...prev, photos: i18n.language.includes('uk') ? 'Максимум 5 фото' : 'Maximum 5 photos' }));
      return;
    }
    
    // Validate files before upload
    const tempFormData = { ...formData, photos: [...formData.photos, ...files.map(file => ({ file }))] };
    const validation = validateCreateAdForm(tempFormData, 1, i18n);
    
    if (validation.errors.photos) {
      setErrors(prev => ({ ...prev, photos: validation.errors.photos }));
      return;
    }
    
    setUploadingPhotos(true);
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    setTimeout(() => {
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
      setUploadingPhotos(false);
      if (errors.photos) {
        setErrors(prev => ({ ...prev, photos: null }));
      }
    }, 1000);
  };

  const removePhoto = (photoId) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }));
  };

  const currencies = [
    { value: 'USD', label: '$ USD' },
    { value: 'EUR', label: '€ EUR' },
    { value: 'UAH', label: '₴ UAH' },
    { value: 'PLN', label: 'zł PLN' }
  ];

  const handleBack = () => {
    setCurrentStep(1);
  };

  const isStep1Valid = () => {
    return formData.title.trim().length >= 5 && 
           formData.description.trim().length >= 20 && 
           formData.category && 
           formData.subcategory && 
           formData.photos.length > 0;
  };

  const isStep2Valid = () => {
    return formData.country && 
           formData.city && 
           formData.address.trim() && 
           formData.details && 
           formData.price.trim() && 
           !isNaN(parseFloat(formData.price)) && 
           parseFloat(formData.price) > 0 &&
           (formData.contactPhone.trim() || formData.contactEmail.trim());
  };

  const countries = [
    { value: '', label: i18n.language.includes('uk') ? 'Оберіть країну' : 'Select country' },
    { value: 'usa', label: `🇺🇸 ${i18n.language.includes('uk') ? 'США' : 'USA'}` },
    { value: 'ukraine', label: `🇺🇦 ${i18n.language.includes('uk') ? 'Україна' : 'Ukraine'}` }
  ];

  const getCities = () => {
    const cities = [
      { value: '', label: i18n.language.includes('uk') ? 'Оберіть місто' : 'Select city' }
    ];

    if (formData.country === 'usa') {
      cities.push(
        { value: 'new-york', label: 'New York' },
        { value: 'los-angeles', label: 'Los Angeles' },
        { value: 'chicago', label: 'Chicago' },
        { value: 'houston', label: 'Houston' },
        { value: 'miami', label: 'Miami' }
      );
    } else if (formData.country === 'ukraine') {
      cities.push(
        { value: 'kyiv', label: i18n.language.includes('uk') ? 'Київ' : 'Kyiv' },
        { value: 'kharkiv', label: i18n.language.includes('uk') ? 'Харків' : 'Kharkiv' },
        { value: 'odesa', label: i18n.language.includes('uk') ? 'Одеса' : 'Odesa' },
        { value: 'dnipro', label: i18n.language.includes('uk') ? 'Дніпро' : 'Dnipro' },
        { value: 'lviv', label: i18n.language.includes('uk') ? 'Львів' : 'Lviv' }
      );
    }

    return cities;
  };

  const getDetailsOptions = () => {
    const details = [
      { value: '', label: i18n.language.includes('uk') ? 'Оберіть деталі' : 'Select details' }
    ];

    if (formData.subcategory === 'apartments') {
      details.push(
        { value: '1-room', label: i18n.language.includes('uk') ? '1 кімната' : '1 room' },
        { value: '2-room', label: i18n.language.includes('uk') ? '2 кімнати' : '2 rooms' },
        { value: '3-room', label: i18n.language.includes('uk') ? '3 кімнати' : '3 rooms' },
        { value: '4-room', label: i18n.language.includes('uk') ? '4+ кімнат' : '4+ rooms' }
      );
    } else if (formData.subcategory === 'cars') {
      details.push(
        { value: 'sedan', label: i18n.language.includes('uk') ? 'Седан' : 'Sedan' },
        { value: 'suv', label: i18n.language.includes('uk') ? 'Позашляховик' : 'SUV' },
        { value: 'hatchback', label: i18n.language.includes('uk') ? 'Хетчбек' : 'Hatchback' },
        { value: 'coupe', label: i18n.language.includes('uk') ? 'Купе' : 'Coupe' }
      );
    } else if (formData.subcategory === 'vacancies') {
      details.push(
        { value: 'full-time', label: i18n.language.includes('uk') ? 'Повний день' : 'Full-time' },
        { value: 'part-time', label: i18n.language.includes('uk') ? 'Неповний день' : 'Part-time' },
        { value: 'remote', label: i18n.language.includes('uk') ? 'Віддалено' : 'Remote' },
        { value: 'contract', label: i18n.language.includes('uk') ? 'Контракт' : 'Contract' }
      );
    } else if (formData.subcategory === 'smartphones') {
      details.push(
        { value: 'new', label: i18n.language.includes('uk') ? 'Новий' : 'New' },
        { value: 'used', label: i18n.language.includes('uk') ? 'Вживаний' : 'Used' },
        { value: 'refurbished', label: i18n.language.includes('uk') ? 'Відновлений' : 'Refurbished' }
      );
    } else {
      details.push(
        { value: 'excellent', label: i18n.language.includes('uk') ? 'Відмінний стан' : 'Excellent condition' },
        { value: 'good', label: i18n.language.includes('uk') ? 'Хороший стан' : 'Good condition' },
        { value: 'fair', label: i18n.language.includes('uk') ? 'Задовільний стан' : 'Fair condition' }
      );
    }

    return details;
  };

  return (
    <div className="create-ad-overlay">
      <div className="create-ad-form">
        <div className="form-header">
          <h3>{t('createAdForm.title')}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}

        {currentStep === 1 && (
          <div className="step-content">
            <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
              <label>{t('createAdForm.step1.title')} *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={t('createAdForm.step1.titlePlaceholder')}
                className={errors.title ? 'input-error' : ''}
                maxLength="100"
              />
              <div className="char-counter">{formData.title.length}/100</div>
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
              <label>{t('createAdForm.step1.description')} *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('createAdForm.step1.descriptionPlaceholder')}
                className={errors.description ? 'input-error' : ''}
                rows="4"
                maxLength="1000"
              />
              <div className="char-counter">{formData.description.length}/1000</div>
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>

            <div className={`form-group ${errors.category ? 'has-error' : ''}`}>
              <label>{t('createAdForm.step1.category')} *</label>
              <CustomSelect
                value={formData.category}
                onChange={(value) => handleInputChange('category', value)}
                options={categories}
                className={errors.category ? 'error' : ''}
              />
              {errors.category && <span className="field-error">{errors.category}</span>}
            </div>

            {formData.category && (
              <div className={`form-group ${errors.subcategory ? 'has-error' : ''}`}>
                <label>{t('createAdForm.step1.subcategory')} *</label>
                <CustomSelect
                  value={formData.subcategory}
                  onChange={(value) => handleInputChange('subcategory', value)}
                  options={getSubcategories()}
                  className={errors.subcategory ? 'error' : ''}
                />
                {errors.subcategory && <span className="field-error">{errors.subcategory}</span>}
              </div>
            )}

            <div className={`form-group ${errors.photos ? 'has-error' : ''}`}>
              <label>{t('createAdForm.step1.photos')} * ({formData.photos.length}/5)</label>
              <div className="photo-upload-area">
                <input
                  type="file"
                  id="photo-upload"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                  disabled={formData.photos.length >= 5 || uploadingPhotos}
                />
                <label htmlFor="photo-upload" className={`photo-upload-btn ${formData.photos.length >= 5 ? 'disabled' : ''}`}>
                  {uploadingPhotos ? (
                    <>🔄 {t('createAdForm.step1.uploading')}</>
                  ) : (
                    <>📷 {t('createAdForm.step1.addPhotos')}</>
                  )}
                </label>
                
                {formData.photos.length > 0 && (
                  <div className="photo-preview-grid">
                    {formData.photos.map(photo => (
                      <div key={photo.id} className="photo-preview">
                        <img src={photo.url} alt={photo.name} />
                        <button 
                          type="button" 
                          className="remove-photo-btn"
                          onClick={() => removePhoto(photo.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.photos && <span className="field-error">{errors.photos}</span>}
            </div>

            <div className="form-actions single">
              <button 
                type="button" 
                className="next-btn" 
                onClick={handleNext}
                disabled={!isStep1Valid()}
              >
                {t('createAdForm.buttons.next')} →
              </button>
            </div>
            
            <div className="step-indicator">
              <span className={`step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>1</span>
              <span className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</span>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-content">
            <div className={`form-group ${errors.country ? 'has-error' : ''}`}>
              <label>{i18n.language.includes('uk') ? 'Країна' : 'Country'} *</label>
              <CustomSelect
                value={formData.country}
                onChange={(value) => handleInputChange('country', value)}
                options={countries}
                className={errors.country ? 'error' : ''}
              />
              {errors.country && <span className="field-error">{errors.country}</span>}
            </div>

            {formData.country && (
              <div className={`form-group ${errors.city ? 'has-error' : ''}`}>
                <label>{i18n.language.includes('uk') ? 'Місто' : 'City'} *</label>
                <CustomSelect
                  value={formData.city}
                  onChange={(value) => handleInputChange('city', value)}
                  options={getCities()}
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>
            )}

            <div className={`form-group ${errors.address ? 'has-error' : ''}`}>
              <label>{i18n.language.includes('uk') ? 'Адреса' : 'Address'} *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder={i18n.language.includes('uk') ? 'Вулиця, будинок, квартира...' : 'Street, building, apartment...'}
                className={errors.address ? 'input-error' : ''}
                maxLength="200"
              />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </div>

            <div className={`form-group ${errors.details ? 'has-error' : ''}`}>
              <label>{i18n.language.includes('uk') ? 'Деталі' : 'Details'} *</label>
              <CustomSelect
                value={formData.details}
                onChange={(value) => handleInputChange('details', value)}
                options={getDetailsOptions()}
                className={errors.details ? 'error' : ''}
              />
              {errors.details && <span className="field-error">{errors.details}</span>}
            </div>

            <div className={`form-group ${errors.price ? 'has-error' : ''}`}>
              <label>{i18n.language.includes('uk') ? 'Ціна' : 'Price'} *</label>
              <div className="price-input-group">
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder={i18n.language.includes('uk') ? 'Введіть ціну...' : 'Enter price...'}
                  className={errors.price ? 'input-error' : ''}
                  min="0"
                  step="0.01"
                />
                <CustomSelect
                  value={formData.currency}
                  onChange={(value) => handleInputChange('currency', value)}
                  options={currencies}
                  className="currency-select"
                />
              </div>
              {errors.price && <span className="field-error">{errors.price}</span>}
            </div>

            <div className="contact-section">
              <h4>{i18n.language.includes('uk') ? 'Контактна інформація' : 'Contact Information'}</h4>
              
              <div className={`form-group ${errors.contactPhone ? 'has-error' : ''}`}>
                <label>{i18n.language.includes('uk') ? 'Телефон' : 'Phone'}</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder={i18n.language.includes('uk') ? '+380 XX XXX XX XX' : '+1 XXX XXX XXXX'}
                  className={errors.contactPhone ? 'input-error' : ''}
                />
                {errors.contactPhone && <span className="field-error">{errors.contactPhone}</span>}
              </div>
              
              <div className={`form-group ${errors.contactEmail ? 'has-error' : ''}`}>
                <label>{i18n.language.includes('uk') ? 'Email' : 'Email'}</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder={i18n.language.includes('uk') ? 'your@email.com' : 'your@email.com'}
                  className={errors.contactEmail ? 'input-error' : ''}
                />
                {errors.contactEmail && <span className="field-error">{errors.contactEmail}</span>}
              </div>
              
              {errors.contact && <span className="field-error contact-error">{errors.contact}</span>}
            </div>

            <div className="form-actions">
              <button type="button" className="back-btn" onClick={handleBack}>
                ← {i18n.language.includes('uk') ? 'Назад' : 'Back'}
              </button>
              <button 
                type="button" 
                className="submit-btn" 
                onClick={handleNext}
                disabled={!isStep2Valid() || isSubmitting}
              >
                {isSubmitting 
                  ? (i18n.language.includes('uk') ? 'Створення...' : 'Creating...') 
                  : (i18n.language.includes('uk') ? 'Створити' : 'Create')
                }
              </button>
            </div>
            
            <div className="step-indicator">
              <span className={`step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>1</span>
              <span className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</span>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-content success-content">
            <div className="success-icon">✅</div>
            <h3 className="success-title">
              {i18n.language.includes('uk') ? 'Оголошення успішно створено!' : 'Ad created successfully!'}
            </h3>
            <p className="success-text">
              {i18n.language.includes('uk') 
                ? 'Ваше оголошення було успішно опубліковано та з\'явиться на карті найближчим часом.' 
                : 'Your ad has been successfully published and will appear on the map shortly.'}
            </p>
            <div className="form-actions single">
              <button type="button" className="next-btn" onClick={onClose}>
                {i18n.language.includes('uk') ? 'Закрити' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAdForm;