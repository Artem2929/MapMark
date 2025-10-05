import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../ui/CustomSelect';
import CountrySelect from '../ui/CountrySelect';
import { validateCreateAdForm } from '../../utils/createAdValidation';
import adService from '../../services/adService';
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

  const categories = React.useMemo(() => [
    { value: '', label: t('createAdForm.step1.selectCategory') },
    { value: 'realty', label: `🏠 ${t('createAdForm.categories.realty')}` },
    { value: 'transport', label: `🚗 ${t('createAdForm.categories.transport')}` },
    { value: 'work', label: `💼 ${t('createAdForm.categories.work')}` },
    { value: 'services', label: `🔧 ${t('createAdForm.categories.services')}` },
    { value: 'electronics', label: `📱 ${t('createAdForm.categories.electronics')}` },
    { value: 'places', label: `🍽️ ${t('createAdForm.categories.places')}` },
    { value: 'entertainment', label: `🎯 ${t('createAdForm.categories.entertainment')}` }
  ], [t]);

  const getSubcategories = React.useMemo(() => {
    const subcategories = [
      { value: '', label: t('createAdForm.step1.selectSubcategory') }
    ];

    if (formData.category === 'realty') {
      subcategories.push(
        { value: 'apartments', label: `🏢 ${t('createAdForm.subcategories.apartments')}` },
        { value: 'houses', label: `🏡 ${t('createAdForm.subcategories.houses')}` },
        { value: 'commercial', label: `🏬 ${t('createAdForm.subcategories.commercial')}` },
        { value: 'land', label: `🌾 ${t('createAdForm.subcategories.land')}` }
      );
    } else if (formData.category === 'transport') {
      subcategories.push(
        { value: 'cars', label: `🚙 ${t('createAdForm.subcategories.cars')}` },
        { value: 'motorcycles', label: `🏍️ ${t('createAdForm.subcategories.motorcycles')}` },
        { value: 'trucks', label: `🚛 ${t('createAdForm.subcategories.trucks')}` },
        { value: 'boats', label: `⛵ ${t('createAdForm.subcategories.boats')}` }
      );
    } else if (formData.category === 'work') {
      subcategories.push(
        { value: 'vacancies', label: `📋 ${t('createAdForm.subcategories.vacancies')}` },
        { value: 'resumes', label: `📄 ${t('createAdForm.subcategories.resumes')}` },
        { value: 'freelance', label: `💻 ${t('createAdForm.subcategories.freelance')}` }
      );
    } else if (formData.category === 'services') {
      subcategories.push(
        { value: 'construction', label: `🔨 ${t('createAdForm.subcategories.construction')}` },
        { value: 'household', label: `🏠 ${t('createAdForm.subcategories.household')}` },
        { value: 'education', label: `📚 ${t('createAdForm.subcategories.education')}` },
        { value: 'beauty', label: `💄 ${t('createAdForm.subcategories.beauty')}` }
      );
    } else if (formData.category === 'electronics') {
      subcategories.push(
        { value: 'smartphones', label: `📱 ${t('createAdForm.subcategories.smartphones')}` },
        { value: 'computers', label: `💻 ${t('createAdForm.subcategories.computers')}` },
        { value: 'appliances', label: `🔌 ${t('createAdForm.subcategories.appliances')}` }
      );
    } else if (formData.category === 'places') {
      subcategories.push(
        { value: 'cafe', label: `☕ ${t('createAdForm.subcategories.cafe')}` },
        { value: 'restaurant', label: `🍽️ ${t('createAdForm.subcategories.restaurant')}` },
        { value: 'hotel', label: `🏨 ${t('createAdForm.subcategories.hotel')}` }
      );
    } else if (formData.category === 'entertainment') {
      subcategories.push(
        { value: 'park', label: `🌳 ${t('createAdForm.subcategories.park')}` },
        { value: 'museum', label: `🏛️ ${t('createAdForm.subcategories.museum')}` },
        { value: 'shop', label: `🛍️ ${t('createAdForm.subcategories.shop')}` }
      );
    }

    return subcategories;
  }, [formData.category, t]);

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
    if (currentStep === 4) {
      localStorage.removeItem('createAdFormData');
    }
  }, [currentStep]);

  const validateStep1 = () => {
    const validation = validateCreateAdForm(formData, 1, i18n);
    setErrors(validation.errors);
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.photos || formData.photos.length === 0) {
      newErrors.photos = t('createAdForm.validation.photosRequired');
    }
    
    setErrors(newErrors);
  };

  const validateStep3 = () => {
    const validation = validateCreateAdForm(formData, 2, i18n);
    setErrors(validation.errors);
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      validateStep1();
      if (isStep1Valid()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      validateStep2();
      if (isStep2Valid()) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      validateStep3();
      if (isStep3Valid()) {
        setIsSubmitting(true);
        try {
          await adService.createAd(formData);
          setCurrentStep(4);
        } catch (error) {
          setErrors({ submit: error.message || t('createAdForm.validation.submitError') });
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file count
    if (files.length + formData.photos.length > 5) {
      setErrors(prev => ({ ...prev, photos: t('createAdForm.validation.photosMax') }));
      return;
    }

    // Validate file types and sizes
    const invalidFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return !isValidType || !isValidSize;
    });

    if (invalidFiles.length > 0) {
      setErrors(prev => ({ 
        ...prev, 
        photos: t('createAdForm.validation.photosInvalid') || 'Invalid file type or size (max 5MB)'
      }));
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
    setFormData(prev => {
      const photoToRemove = prev.photos.find(photo => photo.id === photoId);
      if (photoToRemove?.url) {
        URL.revokeObjectURL(photoToRemove.url);
      }
      return {
        ...prev,
        photos: prev.photos.filter(photo => photo.id !== photoId)
      };
    });
  };

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      formData.photos.forEach(photo => {
        if (photo.url) {
          URL.revokeObjectURL(photo.url);
        }
      });
    };
  }, []);

  const currencies = [
    { value: 'USD', label: '$' },
    { value: 'UAH', label: '₴' }
  ];

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  const isStep1Valid = () => {
    return formData.title.trim().length > 0 && 
           formData.description.trim().length >= 10 && 
           formData.category && 
           formData.subcategory;
  };

  const isStep2Valid = () => {
    return formData.photos.length > 0;
  };

  const isStep3Valid = () => {
    return formData.country && 
           formData.city && 
           formData.address.trim() && 
           formData.details && 
           formData.price.trim() && 
           !isNaN(parseFloat(formData.price)) && 
           parseFloat(formData.price) > 0 &&
           (formData.contactPhone.trim() || formData.contactEmail.trim());
  };



  const getCities = React.useMemo(() => {
    const cities = [
      { value: '', label: t('createAdForm.step2.selectCity') }
    ];

    if (formData.country === 'us') {
      cities.push(
        { value: 'new-york', label: t('createAdForm.cities.new-york') },
        { value: 'los-angeles', label: t('createAdForm.cities.los-angeles') },
        { value: 'chicago', label: t('createAdForm.cities.chicago') },
        { value: 'houston', label: t('createAdForm.cities.houston') },
        { value: 'miami', label: t('createAdForm.cities.miami') }
      );
    } else if (formData.country === 'ua') {
      cities.push(
        { value: 'kyiv', label: t('createAdForm.cities.kyiv') },
        { value: 'kharkiv', label: t('createAdForm.cities.kharkiv') },
        { value: 'odesa', label: t('createAdForm.cities.odesa') },
        { value: 'dnipro', label: t('createAdForm.cities.dnipro') },
        { value: 'lviv', label: t('createAdForm.cities.lviv') }
      );
    }

    return cities;
  }, [formData.country, t]);

  const getDetailsOptions = React.useMemo(() => {
    const details = [
      { value: '', label: t('createAdForm.step2.selectDetails') }
    ];

    if (formData.subcategory === 'apartments') {
      details.push(
        { value: '1-room', label: t('createAdForm.details.1-room') },
        { value: '2-room', label: t('createAdForm.details.2-room') },
        { value: '3-room', label: t('createAdForm.details.3-room') },
        { value: '4-room', label: t('createAdForm.details.4-room') }
      );
    } else if (formData.subcategory === 'cars') {
      details.push(
        { value: 'sedan', label: t('createAdForm.details.sedan') },
        { value: 'suv', label: t('createAdForm.details.suv') },
        { value: 'hatchback', label: t('createAdForm.details.hatchback') },
        { value: 'coupe', label: t('createAdForm.details.coupe') }
      );
    } else if (formData.subcategory === 'vacancies') {
      details.push(
        { value: 'full-time', label: t('createAdForm.details.full-time') },
        { value: 'part-time', label: t('createAdForm.details.part-time') },
        { value: 'remote', label: t('createAdForm.details.remote') },
        { value: 'contract', label: t('createAdForm.details.contract') }
      );
    } else if (formData.subcategory === 'smartphones') {
      details.push(
        { value: 'new', label: t('createAdForm.details.new') },
        { value: 'used', label: t('createAdForm.details.used') },
        { value: 'refurbished', label: t('createAdForm.details.refurbished') }
      );
    } else {
      details.push(
        { value: 'excellent', label: t('createAdForm.details.excellent') },
        { value: 'good', label: t('createAdForm.details.good') },
        { value: 'fair', label: t('createAdForm.details.fair') }
      );
    }

    return details;
  }, [formData.subcategory, t]);

  return (
    <div className="create-ad-overlay">
      <div className="create-ad-form">
        <div className="form-header">
          <h3>{t('createAdForm.title')}</h3>
          <button className="close-btn" onClick={() => {
            localStorage.removeItem('createAdFormData');
            onClose();
          }}>×</button>
        </div>



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
                  options={getSubcategories}
                  className={errors.subcategory ? 'error' : ''}
                />
                {errors.subcategory && <span className="field-error">{errors.subcategory}</span>}
              </div>
            )}

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
              <span className={`step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>2</span>
              <span className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</span>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-content">
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

            <div className="form-actions">
              <button type="button" className="back-btn" onClick={handleBack}>
                ← {t('createAdForm.buttons.back')}
              </button>
              <button 
                type="button" 
                className="next-btn" 
                onClick={handleNext}
                disabled={!isStep2Valid()}
              >
                {t('createAdForm.buttons.next')} →
              </button>
            </div>
            
            <div className="step-indicator">
              <span className={`step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>1</span>
              <span className={`step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>2</span>
              <span className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</span>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-content">
            <div className={`form-group ${errors.country ? 'has-error' : ''}`}>
              <label>{t('createAdForm.step2.country')} *</label>
              <CountrySelect
                value={formData.country}
                onChange={(value) => handleInputChange('country', value)}
                placeholder={t('createAdForm.step2.selectCountry')}
                className={errors.country ? 'error' : ''}
              />
              {errors.country && <span className="field-error">{errors.country}</span>}
            </div>

            {formData.country && (
              <div className={`form-group ${errors.city ? 'has-error' : ''}`}>
                <label>{t('createAdForm.step2.city')} *</label>
                <CustomSelect
                  value={formData.city}
                  onChange={(value) => handleInputChange('city', value)}
                  options={getCities}
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>
            )}

            <div className={`form-group ${errors.address ? 'has-error' : ''}`}>
              <label>{t('createAdForm.step2.address')} *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder={t('createAdForm.step2.addressPlaceholder')}
                className={errors.address ? 'input-error' : ''}
                maxLength="200"
              />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </div>

            <div className={`form-group ${errors.details ? 'has-error' : ''}`}>
              <label>{t('createAdForm.step2.details')} *</label>
              <CustomSelect
                value={formData.details}
                onChange={(value) => handleInputChange('details', value)}
                options={getDetailsOptions}
                className={errors.details ? 'error' : ''}
              />
              {errors.details && <span className="field-error">{errors.details}</span>}
            </div>

            <div className={`form-group ${errors.price ? 'has-error' : ''}`}>
              <label>{t('createAdForm.step2.price')} *</label>
              <div className="price-input-group">
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder={t('createAdForm.step2.pricePlaceholder')}
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

            <div className={`form-group ${errors.contactPhone ? 'has-error' : ''}`}>
                <label>{t('createAdForm.step2.phone')}</label>
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
                <label>{t('createAdForm.step2.email')}</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="your@email.com"
                  className={errors.contactEmail ? 'input-error' : ''}
                />
                {errors.contactEmail && <span className="field-error">{errors.contactEmail}</span>}
              </div>
              
              {errors.contact && <span className="field-error contact-error">{errors.contact}</span>}

            <div className="form-actions">
              <button type="button" className="back-btn" onClick={handleBack}>
                ← {t('createAdForm.buttons.back')}
              </button>
              <button 
                type="button" 
                className="submit-btn" 
                onClick={handleNext}
                disabled={!isStep3Valid() || isSubmitting}
              >
                {isSubmitting 
                  ? t('createAdForm.buttons.creating') 
                  : t('createAdForm.buttons.create')
                }
              </button>
            </div>
            
            <div className="step-indicator">
              <span className={`step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>1</span>
              <span className={`step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>2</span>
              <span className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</span>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="step-content success-content">
            <div className="success-icon">✅</div>
            <h3 className="success-title">
              {t('createAdForm.success.title')}
            </h3>
            <p className="success-text">
              {t('createAdForm.success.message')}
            </p>
            <div className="form-actions single">
              <button type="button" className="next-btn" onClick={onClose}>
                {t('createAdForm.success.close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAdForm;