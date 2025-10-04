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
    subcategory: ''
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
      ...(field === 'category' ? { subcategory: '' } : {})
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

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  return (
    <div className="create-ad-overlay">
      <div className="create-ad-form">
        <div className="form-header">
          <h3>{i18n.language.includes('uk') ? 'Створити оголошення' : 'Create Ad'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="step-indicator">
          <span className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</span>
          <span className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</span>
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

            <div className="form-actions">
              <button type="button" className="next-btn" onClick={handleNext}>
                {i18n.language.includes('uk') ? 'Далі' : 'Next'} →
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-content">
            <p>{i18n.language.includes('uk') ? 'Крок 2 - В розробці' : 'Step 2 - In development'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAdForm;