import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../ui/CustomSelect';
import './CreateAdForm.css';

const CreateAdForm = ({ onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    country: '',
    location: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    photos: []
  });

  const countries = [
    { code: 'UA', name_en: 'Ukraine' },
    { code: 'US', name_en: 'United States' },
    { code: 'DE', name_en: 'Germany' },
    { code: 'FR', name_en: 'France' },
    { code: 'ES', name_en: 'Spain' },
    { code: 'IT', name_en: 'Italy' },
    { code: 'GB', name_en: 'United Kingdom' },
    { code: 'PL', name_en: 'Poland' },
    { code: 'CA', name_en: 'Canada' },
    { code: 'AU', name_en: 'Australia' },
    { code: 'JP', name_en: 'Japan' },
    { code: 'CN', name_en: 'China' }
  ];

  const categories = [
    { id: 'housing', name: t('ads.categories.housing') },
    { id: 'cars', name: t('ads.categories.cars') },
    { id: 'restaurants', name: t('ads.categories.restaurants') },
    { id: 'hotels', name: t('ads.categories.hotels') },
    { id: 'events', name: t('ads.categories.events') },
    { id: 'tourism', name: t('ads.categories.tourism') },
    { id: 'services', name: t('ads.categories.services') },
    { id: 'other', name: t('ads.categories.other') }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.photos.length + files.length <= 3) {
      setFormData(prev => ({ 
        ...prev, 
        photos: [...prev.photos, ...files] 
      }));
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get coordinates for the location
    try {
      const query = `${formData.location}, ${formData.country}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const adData = {
          ...formData,
          coordinates: [parseFloat(lat), parseFloat(lon)],
          id: Date.now(),
          createdAt: new Date().toISOString()
        };
        
        onSubmit(adData);
        onClose();
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  return (
    <div className="create-ad-overlay">
      <div className="create-ad-form">
        <div className="drag-handle"></div>
        <div className="form-header">
          <h3>{t('ads.createAdTitle')}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('ads.form.country')}</label>
            <CustomSelect
              options={countries}
              value={formData.country}
              onChange={(value) => handleInputChange('country', value)}
              placeholder={t('ads.form.selectCountry')}
            />
          </div>

          <div className="form-group">
            <label>{t('ads.form.location')}</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder={t('ads.form.locationPlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('ads.form.category')}</label>
            <CustomSelect
              options={categories.map(cat => ({ code: cat.id, name_en: cat.name }))}
              value={formData.category}
              onChange={(value) => handleInputChange('category', value)}
              placeholder={t('ads.form.selectCategory')}
            />
          </div>

          <div className="form-group">
            <label>{t('ads.form.dateRange')}</label>
            <div className="date-inputs">
              <input
                type="date"
                value={formData.dateFrom}
                onChange={(e) => handleInputChange('dateFrom', e.target.value)}
              />
              <span>to</span>
              <input
                type="date"
                value={formData.dateTo}
                onChange={(e) => handleInputChange('dateTo', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('ads.form.photos')} ({formData.photos.length}/3)</label>
            <label className="file-input-btn">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={formData.photos.length >= 3}
                style={{ display: 'none' }}
              />
              Choose Files
            </label>
            <div className="photo-preview">
              {formData.photos.map((photo, index) => (
                <div key={index} className="photo-item">
                  <img src={URL.createObjectURL(photo)} alt={`Preview ${index + 1}`} />
                  <button type="button" onClick={() => removePhoto(index)}>×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              {t('ads.form.cancel')}
            </button>
            <button type="submit" className="publish-btn">
              {t('ads.form.publish')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdForm;