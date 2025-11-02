import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../utils/apiUtils';

import CustomSelect from '../ui/CustomSelect';
import ServiceItem from './ServiceItem';
import './ServicesSection.css';

const ServicesSection = ({ userId, isOwnProfile, services = [], onServiceAdded }) => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    category: 'service',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);



  const handleDeleteService = (serviceId) => {
    window.location.reload();
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setNewService({
      title: service.title,
      description: service.description,
      category: service.category,
      photo: null
    });
    setPhotoPreview(service.photo);
    setShowEditModal(true);
  };

  const handleUpdateService = async () => {
    try {
      let photoData = editingService.photo;
      
      if (newService.photo) {
        const formData = new FormData();
        formData.append('photo', newService.photo);
        
        const photoResponse = await fetch('http://localhost:3001/api/upload/photo', {
          method: 'POST',
          body: formData
        });
        
        if (photoResponse.ok) {
          const photoResult = await photoResponse.json();
          if (photoResult.success) {
            photoData = photoResult.photoUrl;
          }
        }
      }
      
      const response = await fetch(`http://localhost:3001/api/services/${editingService._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newService.title,
          description: newService.description,
          category: newService.category,
          photo: photoData
        })
      });
      
      const result = await response.json();
      if (result.success) {
        window.location.reload();
      }
      
      setShowEditModal(false);
      setEditingService(null);
      setNewService({ title: '', description: '', category: 'service', photo: null });
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating service:', error);
      setShowEditModal(false);
      setEditingService(null);
      setNewService({ title: '', description: '', category: 'service', photo: null });
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddService = async () => {
    console.log('Starting to add service...', { newService, userId });
    
    try {
      let photoData = photoPreview; // Використовуємо preview як fallback
      
      // Завантажуємо фото якщо воно є
      if (newService.photo) {
        try {
          const formData = new FormData();
          formData.append('photo', newService.photo);
          
          console.log('Uploading photo...');
          const photoResponse = await fetch('http://localhost:3001/api/upload/photo', {
            method: 'POST',
            body: formData
          });
          
          if (photoResponse.ok) {
            const photoResult = await photoResponse.json();
            console.log('Photo upload result:', photoResult);
            if (photoResult.success) {
              photoData = photoResult.photoUrl;
            }
          } else {
            console.error('Photo upload failed:', photoResponse.status);
          }
        } catch (photoError) {
          console.error('Photo upload error:', photoError);
        }
      }
      
      const serviceData = {
        title: newService.title,
        description: newService.description,
        category: newService.category,
        photo: photoData,
        userId
      };
      
      console.log('Sending service data:', serviceData);
      
      const response = await apiPost('/services', serviceData);
      const result = await response.json();
      
      console.log('Service creation response:', result);
      
      if (result.success) {
        console.log('Service created successfully!');
        // Додаємо нову послугу до списку
        if (onServiceAdded) {
          onServiceAdded(result.data);
        }
        // Закриваємо модал
        setShowAddModal(false);
        setNewService({ title: '', description: '', category: 'service', photo: null });
        setPhotoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Показуємо повідомлення про успіх
        alert('Послугу успішно додано!');
        return;
      } else {
        console.error('Service creation failed:', result.message);
        alert('Помилка: ' + (result.message || 'Не вдалося додати послугу'));
      }
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Помилка при додаванні послуги: ' + error.message);
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
            <ServiceItem 
              key={service._id} 
              service={service} 
              onDelete={handleDeleteService}
              onEdit={handleEditService}
              isOwnProfile={isOwnProfile}
            />
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
                  maxLength={50}
                  onChange={(e) => setNewService({...newService, title: e.target.value})}
                />
                <div className="char-counter">{newService.title.length}/50</div>
              </div>
              
              <div className="form-field">
                <label className="form-label">Опис</label>
                <textarea
                  placeholder="Детальний опис вашої послуги або товару"
                  value={newService.description}
                  maxLength={200}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                />
                <div className="char-counter">{newService.description.length}/200</div>
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
                <label className="form-label">Фото</label>
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
                  disabled={!newService.title || !photoPreview}
                >
                  Додати
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="profile-service-modal" onClick={() => setShowEditModal(false)}>
          <div className="profile-service-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="profile-service-modal-header">
              <h3>Редагувати послугу</h3>
              <button onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="profile-service-modal-body">
              <div className="form-field">
                <label className="form-label">Назва</label>
                <input
                  type="text"
                  placeholder="Введіть назву послуги або товару"
                  value={newService.title}
                  maxLength={50}
                  onChange={(e) => setNewService({...newService, title: e.target.value})}
                />
                <div className="char-counter">{newService.title.length}/50</div>
              </div>
              
              <div className="form-field">
                <label className="form-label">Опис</label>
                <textarea
                  placeholder="Детальний опис вашої послуги або товару"
                  value={newService.description}
                  maxLength={200}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                />
                <div className="char-counter">{newService.description.length}/200</div>
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
                <label className="form-label">Фото</label>
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
                <button type="button" onClick={() => setShowEditModal(false)}>Скасувати</button>
                <button 
                  type="button" 
                  onClick={handleUpdateService}
                  disabled={!newService.title || !photoPreview}
                >
                  Оновити
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