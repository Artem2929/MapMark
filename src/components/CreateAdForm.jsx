import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './CreateAdForm.css';

const CreateAdForm = ({ onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    country: '',
    city: '',
    location: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    photos: []
  });

  const countries = [
    'Ukraine', 'United States', 'Germany', 'France', 'Spain', 'Italy', 
    'United Kingdom', 'Poland', 'Canada', 'Australia', 'Japan', 'China'
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
      const query = `${formData.location}, ${formData.city}, ${formData.country}`;
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
            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              required
            >
              <option value="">{t('ads.form.selectCountry')}</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('ads.form.city')}</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder={t('ads.form.cityPlaceholder')}
              required
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
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              required
            >
              <option value="">{t('ads.form.selectCategory')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('ads.form.dateRange')}</label>
            <div className="date-range">
              <input
                type="date"
                value={formData.dateFrom}
                onChange={(e) => handleInputChange('dateFrom', e.target.value)}
              />
              <span>-</span>
              <input
                type="date"
                value={formData.dateTo}
                onChange={(e) => handleInputChange('dateTo', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('ads.form.photos')} ({formData.photos.length}/3)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={formData.photos.length >= 3}
            />
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