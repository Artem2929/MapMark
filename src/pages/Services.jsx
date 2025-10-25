import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import './Services.css';

const Services = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    photo: null
  });

  useEffect(() => {
    loadServices();
  }, [category]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      
      const response = await fetch(`http://localhost:3000/api/services/user/${userId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          let filteredServices = result.data;
          if (category) {
            filteredServices = result.data.filter(service => service.category === category);
          }
          setServices(filteredServices);
        }
      } else {
        // Якщо сервер не доступний, ставимо порожній масив
        setServices([]);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      // При помилці ставимо порожній масив
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTitle = () => {
    if (category === 'service') return 'Послуги';
    if (category === 'product') return 'Товари';
    return 'Мої послуги / товари';
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const handleSubmit = async () => {
    if (formData.title && formData.description) {
      try {
        const userId = localStorage.getItem('userId');
        
        // Спочатку завантажуємо фото, якщо воно є
        let photoUrl = null;
        if (formData.photo) {
          const photoFormData = new FormData();
          photoFormData.append('photo', formData.photo);
          
          const photoResponse = await fetch('http://localhost:3000/api/upload/photo', {
            method: 'POST',
            body: photoFormData
          });
          
          if (photoResponse.ok) {
            const photoResult = await photoResponse.json();
            photoUrl = photoResult.photoUrl;
          }
        }
        
        // Створюємо послугу/товар
        const serviceData = {
          title: formData.title,
          description: formData.description,
          price: formData.price || null,
          category: category || 'service',
          photo: photoUrl,
          userId: userId
        };
        
        const response = await fetch('http://localhost:3000/api/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(serviceData)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Послуга/товар створено:', result);
          
          // Оновлюємо список послуг
          loadServices();
          
          // Закриваємо модальне вікно
          setShowModal(false);
          setFormData({ title: '', description: '', price: '', photo: null });
        } else {
          console.error('Помилка створення послуги/товару');
        }
      } catch (error) {
        console.error('Помилка:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setFormData({ title: '', description: '', price: '', photo: null });
  };

  const handleDelete = async (serviceId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/services/${serviceId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Оновлюємо список після видалення
        loadServices();
      } else {
        console.error('Помилка видалення послуги/товару');
      }
    } catch (error) {
      console.error('Помилка:', error);
    }
  };

  const breadcrumbItems = [
    { label: 'Профіль', link: '/profile' },
    { label: getCategoryTitle() }
  ];

  return (
    <div className="services-page">
      <div className="services-container">
        <Breadcrumbs items={breadcrumbItems} />
        
        {loading ? (
          <div className="services-loading">Завантаження...</div>
        ) : (
          <div className="services-grid">
            {services.length > 0 ? (
              <>
                {services.map((service) => (
                  <div key={service._id} className="service-card" onClick={() => setSelectedService(service)}>
                    <div className="service-image">
                      {service.photo ? (
                        <img src={service.photo} alt={service.title} />
                      ) : (
                        <div className="service-placeholder">
                          <span>{service.category === 'service' ? '💼' : '📦'}</span>
                        </div>
                      )}
                      <div className="service-actions">
                        <button className="delete-btn" onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(service._id);
                        }}>
                          Видалити
                        </button>
                      </div>
                    </div>
                    <div className="service-stats">
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                        <div className="service-stat-item">
                          {service.title}
                        </div>
                        <div className="service-stat-item price">
                          {service.price && service.price !== '' ? `${service.price} грн` : 'Безкоштовно'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="add-service-card">
                  <button className="add-service-grid-btn" onClick={() => setShowModal(true)}>
                    <span>+</span>
                    <span>Додати {category === 'service' ? 'послугу' : category === 'product' ? 'товар' : 'оголошення'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="no-services">
                <p>У вас поки немає {category === 'service' ? 'послуг' : category === 'product' ? 'товарів' : 'оголошень'}</p>
                <button className="add-service-btn" onClick={() => setShowModal(true)}>
                  <span>+</span> Додати {category === 'service' ? 'послугу' : category === 'product' ? 'товар' : 'оголошення'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {showModal && (
        <div className="service-modal">
          <div className="service-modal-content">
            <button className="service-modal-close" onClick={handleCancel}>×</button>
            <div className="service-modal-image">
              <div className="simple-drop-zone" onClick={() => document.getElementById('service-photo-input').click()}>
                {formData.photo ? (
                  <img src={URL.createObjectURL(formData.photo)} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <>
                    <div style={{fontSize: '48px', marginBottom: '16px', color: '#3b82f6'}}>+</div>
                    <p>Перетягніть фото сюди або натисніть для вибору</p>
                  </>
                )}
                <input 
                  id="service-photo-input" 
                  accept="image/*" 
                  type="file" 
                  style={{display: 'none'}} 
                  onChange={handlePhotoUpload}
                />
              </div>
            </div>
            <div className="service-modal-sidebar">
              <div className="service-modal-header">
                <h4>Додати {category === 'service' ? 'послугу' : category === 'product' ? 'товар' : 'оголошення'}</h4>
              </div>
              <div className="service-modal-form">
                <input 
                  type="text" 
                  placeholder="Назва..." 
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                  className="service-input"
                />
                <textarea 
                  className="service-textarea" 
                  placeholder="Опис..." 
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                />
                <input 
                  type="number" 
                  placeholder="Ціна (грн)..." 
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                  className="service-input"
                />
              </div>
              <div className="service-modal-actions">
                <button className="service-modal-btn cancel" onClick={handleCancel}>Скасувати</button>
                <button 
                  className={`service-modal-btn submit ${!formData.title || !formData.description ? 'disabled' : ''}`} 
                  disabled={!formData.title || !formData.description}
                  onClick={handleSubmit}
                >
                  Опублікувати
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {selectedService && (
        <div className="service-detail-modal">
          <div className="service-detail-modal-content">
            <button className="service-detail-modal-close" onClick={() => setSelectedService(null)}>×</button>
            <div className="service-detail-modal-image">
              {selectedService.photo ? (
                <img src={selectedService.photo} alt={selectedService.title} />
              ) : (
                <div className="service-detail-modal-placeholder">
                  <span>{selectedService.category === 'service' ? '💼' : '📦'}</span>
                </div>
              )}
            </div>
            <div className="service-detail-modal-sidebar">
              <div className="service-detail-modal-header">
                <h4>{selectedService.title}</h4>
                <div className="service-detail-price">
                  {selectedService.price && selectedService.price !== '' ? `${selectedService.price} грн` : 'Безкоштовно'}
                </div>
              </div>
              <div className="service-detail-description">
                <p>{selectedService.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;