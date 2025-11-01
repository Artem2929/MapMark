import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import './Services.css';

const Services = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get('category');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    photo: null
  });

  const getCategoryTitle = () => {
    if (category === 'service') return 'Послуги';
    if (category === 'product') return 'Товари';
    return 'Послуги та товари';
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
          setShowModal(false);
          setFormData({ title: '', description: '', price: '', photo: null });
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error:', error);
      }
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
        
        <div className="services-header">
          <h1>{getCategoryTitle()}</h1>
          <button className="add-service-btn" onClick={() => setShowModal(true)}>
            <span>+</span> Додати {category === 'service' ? 'послугу' : 'товар'}
          </button>
        </div>
        
        <div className="no-services">
          <p>Додайте свій перший {category === 'service' ? 'сервіс' : 'товар'}</p>
        </div>
      </div>
      
      {showModal && (
        <div className="service-modal">
          <div className="service-modal-content">
            <button className="service-modal-close" onClick={() => setShowModal(false)}>×</button>
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
                <h4>Додати {category === 'service' ? 'послугу' : 'товар'}</h4>
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
                <button className="service-modal-btn cancel" onClick={() => setShowModal(false)}>Скасувати</button>
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
    </div>
  );
};

export default Services;