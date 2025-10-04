import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../ui/CustomSelect';
import './CreateAdForm.css';

const CreateAdForm = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    country: '',
    city: '',
    details: '',
    price: ''
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
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = i18n.language.includes('uk') ? 'Назва є обов\'язковою' : 'Title is required';
    }
    if (!formData.category) {
      newErrors.category = i18n.language.includes('uk') ? 'Категорія є обов\'язковою' : 'Category is required';
    }
    if (!formData.subcategory) {
      newErrors.subcategory = i18n.language.includes('uk') ? 'Підкатегорія є обов\'язковою' : 'Subcategory is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.country) {
      newErrors.country = i18n.language.includes('uk') ? 'Країна є обов\'язковою' : 'Country is required';
    }
    if (!formData.city) {
      newErrors.city = i18n.language.includes('uk') ? 'Місто є обов\'язковим' : 'City is required';
    }
    if (!formData.details) {
      newErrors.details = i18n.language.includes('uk') ? 'Деталі є обов\'язковими' : 'Details are required';
    }
    if (!formData.price.trim()) {
      newErrors.price = i18n.language.includes('uk') ? 'Ціна є обов\'язковою' : 'Price is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      // Submit form
      console.log('Form submitted:', formData);
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const isStep1Valid = () => {
    return formData.title.trim() && formData.category && formData.subcategory;
  };

  const isStep2Valid = () => {
    return formData.country && formData.city && formData.details && formData.price.trim();
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
          <h3>{i18n.language.includes('uk') ? 'Створити оголошення' : 'Create Ad'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {currentStep === 1 && (
          <div className="step-content">
            <div className="form-group">
              <label>{i18n.language.includes('uk') ? 'Назва' : 'Title'} *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={i18n.language.includes('uk') ? 'Введіть назву оголошення...' : 'Enter ad title...'}
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label>{i18n.language.includes('uk') ? 'Категорія' : 'Category'} *</label>
              <CustomSelect
                value={formData.category}
                onChange={(value) => handleInputChange('category', value)}
                options={categories}
                className={errors.category ? 'error' : ''}
              />
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>

            {formData.category && (
              <div className="form-group">
                <label>{i18n.language.includes('uk') ? 'Підкатегорія' : 'Subcategory'} *</label>
                <CustomSelect
                  value={formData.subcategory}
                  onChange={(value) => handleInputChange('subcategory', value)}
                  options={getSubcategories()}
                  className={errors.subcategory ? 'error' : ''}
                />
                {errors.subcategory && <span className="error-message">{errors.subcategory}</span>}
              </div>
            )}

            <div className="form-actions single">
              <button 
                type="button" 
                className="next-btn" 
                onClick={handleNext}
                disabled={!isStep1Valid()}
              >
                {i18n.language.includes('uk') ? 'Далі' : 'Next'} →
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
            <div className="form-group">
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
              <div className="form-group">
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

            <div className="form-group">
              <label>{i18n.language.includes('uk') ? 'Деталі' : 'Details'} *</label>
              <CustomSelect
                value={formData.details}
                onChange={(value) => handleInputChange('details', value)}
                options={getDetailsOptions()}
                className={errors.details ? 'error' : ''}
              />
              {errors.details && <span className="field-error">{errors.details}</span>}
            </div>

            <div className="form-group">
              <label>{i18n.language.includes('uk') ? 'Ціна' : 'Price'} *</label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder={i18n.language.includes('uk') ? 'Введіть ціну...' : 'Enter price...'}
                className={errors.price ? 'input-error' : ''}
              />
              {errors.price && <span className="field-error">{errors.price}</span>}
            </div>

            <div className="form-actions">
              <button type="button" className="back-btn" onClick={handleBack}>
                ← {i18n.language.includes('uk') ? 'Назад' : 'Back'}
              </button>
              <button 
                type="button" 
                className="next-btn" 
                onClick={handleNext}
                disabled={!isStep2Valid()}
              >
                {i18n.language.includes('uk') ? 'Створити' : 'Create'}
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