import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../ui/CustomSelect';
import './ServicesSection.css';

const ServicesSection = ({ userId, isOwnProfile }) => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    category: 'service',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadServices();
  }, [userId]);

  const loadServices = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/services/user/${userId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setServices(result.data);
        }
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    }
  };

  const handleAddService = async () => {
    try {
      let photoData = null;
      
      // Завантажуємо фото якщо воно є
      if (newService.photo) {
        try {
          const formData = new FormData();
          formData.append('photo', newService.photo);
          
          const photoResponse = await fetch('http://localhost:3000/api/upload/photo', {
            method: 'POST',
            body: formData
          });
          
          if (photoResponse.ok) {
            const photoResult = await photoResponse.json();
            if (photoResult.success) {
              photoData = photoResult.photoUrl;
            }
          }
        } catch (photoError) {
          // Якщо фото не завантажилося, використовуємо preview
          photoData = photoPreview;
        }
      }
      
      const response = await fetch('http://localhost:3000/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newService.title,
          description: newService.description,
          category: newService.category,
          photo: photoData,
          userId
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setServices([...services, result.data]);
      } else {
        // Якщо сервер недоступний, додаємо локально
        const newServiceWithId = {
          _id: Date.now().toString(),
          title: newService.title,
          description: newService.description,
          category: newService.category,
          photo: photoData,
          userId
        };
        setServices([...services, newServiceWithId]);
      }
      
      setShowAddModal(false);
      setNewService({ title: '', description: '', category: 'service', photo: null });
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error adding service:', error);
      // Додаємо локально при помилці
      const newServiceWithId = {
        _id: Date.now().toString(),
        title: newService.title,
        description: newService.description,
        category: newService.category,
        photo: photoPreview,
        userId
      };
      setServices([...services, newServiceWithId]);
      setShowAddModal(false);
      setNewService({ title: '', description: '', category: 'service', photo: null });
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Розмір файлу не повинен перевищувати 5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert('Можна завантажувати тільки зображення');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
      setNewService({...newService, photo: file});
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setNewService({...newService, photo: null});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="services-section">
      <div className="services-header">
        <h3>Мої послуги / товари ({services.length})</h3>
        {isOwnProfile && (
          <button 
            className="add-service-btn"
            onClick={() => setShowAddModal(true)}
          >
            <span>+</span> Додати послугу
          </button>
        )}
      </div>
      
      <div className="services-grid">
        {services.length > 0 ? (
          services.map((service) => (
            <div 
              key={service._id} 
              className="service-item"
              onClick={() => navigate(`/services?category=${service.category}`)}
            >
              {service.photo && (
                <div className="service-photo">
                  <img src={service.photo} alt={service.title} />
                </div>
              )}
              <div className="service-content">
                <h4 className="service-title">{service.title}</h4>
                <p className="service-description">{service.description}</p>
                <span className="service-category">{service.category === 'service' ? 'Послуга' : 'Товар'}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-services">
            <p>Немає послуг</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="profile-service-modal" onClick={() => setShowAddModal(false)}>
          <div className="profile-service-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="profile-service-modal-header">
              <h3>Додати нову послугу</h3>
              <button onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="profile-service-modal-body">
              <div className="form-field">
                <label className="form-label">Назва</label>
                <input
                  type="text"
                  placeholder="Введіть назву послуги або товару"
                  value={newService.title}
                  onChange={(e) => setNewService({...newService, title: e.target.value})}
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">Опис</label>
                <textarea
                  placeholder="Детальний опис вашої послуги або товару"
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">Категорія</label>
                <CustomSelect
                  value={newService.category}
                  onChange={(value) => setNewService({...newService, category: value})}
                  options={[
                    { value: 'service', label: 'Послуга' },
                    { value: 'product', label: 'Товар' }
                  ]}
                  placeholder="Оберіть категорію"
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">Фото (необов'язково)</label>
                <div className="photo-upload-area">
                  {!photoPreview ? (
                    <div 
                      className="photo-upload-zone"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="photo-upload-icon"></div>
                      <p>Натисніть для вибору фото</p>
                      <span className="photo-upload-hint">JPG, PNG до 5MB</span>
                    </div>
                  ) : (
                    <div className="photo-preview">
                      <img src={photoPreview} alt="Попередній перегляд" />
                      <button 
                        type="button" 
                        className="photo-remove-btn"
                        onClick={removePhoto}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              <div className="profile-service-modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>Скасувати</button>
                <button 
                  type="button" 
                  onClick={handleAddService}
                  disabled={!newService.title}
                >
                  Додати
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesSection;