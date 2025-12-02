import React, { useState } from 'react';
import { classNames } from '../utils/classNames';
import { useOptimizedState } from '../hooks/useOptimizedState';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import './Services.css';

const Services = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get('category');
  const serviceItemId = searchParams.get('serviceItemId');
  const [showModal, setShowModal] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentingService, setCommentingService] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
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
          
          const photoResponse = await fetch('http://localhost:3001/api/upload/photo', {
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
          userId: userId,
          serviceItemId: serviceItemId
        };
        
        const response = await fetch('http://localhost:3001/api/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(serviceData)
        });
        
        if (response.ok) {
          setShowModal(false);
          setFormData({ title: '', description: '', price: '', photo: null });
          loadServices();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const loadComments = async (serviceId) => {
    try {
      setLoadingComments(true);
      const response = await fetch(`http://localhost:3001/api/service-comments/${serviceId}`);
      const result = await response.json();
      
      if (result.success) {
        setComments(result.data);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async (serviceId) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:3001/api/service-likes/${serviceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'like' })
      });
      
      if (response.ok) {
        loadServices();
      }
    } catch (error) {
      console.error('Error liking service:', error);
    }
  };
  
  const handleDislike = async (serviceId) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:3001/api/service-likes/${serviceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'dislike' })
      });
      
      if (response.ok) {
        loadServices();
      }
    } catch (error) {
      console.error('Error disliking service:', error);
    }
  };
  
  const handleComment = (serviceId) => {
    setCommentingService(serviceId);
    setShowCommentModal(true);
  };
  
  const submitComment = () => {
    if (commentText.trim()) {
      addComment(commentingService, commentText.trim());
      setShowCommentModal(false);
      setCommentText('');
      setCommentingService(null);
    }
  };
  
  const addComment = async (serviceId, text) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:3001/api/service-comments/${serviceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, text })
      });
      
      if (response.ok) {
        loadServices();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const loadServices = async () => {
    if (!serviceItemId) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/services/item/${serviceItemId}`);
      const result = await response.json();
      
      if (result.success) {
        setServices(result.data);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };
  
  React.useEffect(() => {
    loadServices();
  }, [serviceItemId]);

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
          <button className="add-service-btn" onClick={useCallback(() => setShowModal(true), [])}>
            <span>+</span> Додати {category === 'service' ? 'послугу' : 'товар'}
          </button>
        </div>
        
        {loading ? (
          <div className="services-loading">
            <p>Завантаження...</p>
          </div>
        ) : (
          <div className="services-grid">
            {services.length > 0 ? (
              services.map((service) => (
                <div key={service._id} className="service-card" onClick={() => {
                  setSelectedService(service);
                  setShowPreview(true);
                  loadComments(service._id);
                }}>
                  <div className="service-image">
                    {service.photo ? (
                      <img src={service.photo} alt={service.title} />
                    ) : (
                      <div className="service-placeholder">💼</div>
                    )}
                  </div>
                  <div className="service-stats">
                    <div className="service-header">
                      <h3 className="service-title">{service.title}</h3>
                      {service.price && (
                        <div className="service-price">{service.price} грн</div>
                      )}
                    </div>
                    <p className="service-description">{service.description}</p>
                    <div className="service-category">
                      {service.category === 'service' ? 'Послуга' : 'Товар'}
                    </div>
                  </div>
                  <div className="post-actions">
                    <button className="like-btn" onClick={(e) => {
                      e.stopPropagation();
                      handleLike(service._id);
                    }}>👍 {service.likesCount || 0}</button>
                    <button className="dislike-btn" onClick={(e) => {
                      e.stopPropagation();
                      handleDislike(service._id);
                    }}>👎 {service.dislikesCount || 0}</button>
                    <button className="comment-btn" onClick={(e) => {
                      e.stopPropagation();
                      handleComment(service._id);
                    }}>💬 {service.commentsCount || 0}</button>
                    <button className="share-btn" onClick={(e) => e.stopPropagation()}>↗️</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-services">
                <p>Немає послуг</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {showModal && (
        <div className="profile-service-modal" onClick={() => setShowModal(false)}>
          <div className="profile-service-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="profile-service-modal-header">
              <h3>Додати {category === 'service' ? 'послугу' : 'товар'}</h3>
              <button onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="profile-service-modal-body">
              <div className="form-field">
                <label className="form-label">Назва</label>
                <input
                  type="text"
                  placeholder="Введіть назву послуги або товару"
                  value={formData.title}
                  maxLength={50}
                  onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                />
                <div className="char-counter">{formData.title.length}/50</div>
              </div>
              
              <div className="form-field">
                <label className="form-label">Опис</label>
                <textarea
                  placeholder="Детальний опис вашої послуги або товару"
                  value={formData.description}
                  maxLength={200}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                />
                <div className="char-counter">{formData.description.length}/200</div>
              </div>
              
              <div className="form-field">
                <label className="form-label">Ціна (необов'язково)</label>
                <input
                  type="number"
                  placeholder="Ціна в гривнях"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">Фото</label>
                <div className="photo-upload-area">
                  {!formData.photo ? (
                    <div 
                      className="photo-upload-zone"
                      onClick={() => document.getElementById('service-photo-input').click()}
                    >
                      <div className="photo-upload-icon"></div>
                      <p>Натисніть для вибору фото</p>
                      <span className="photo-upload-hint">JPG, PNG до 5MB</span>
                    </div>
                  ) : (
                    <div className="photo-preview">
                      <img src={URL.createObjectURL(formData.photo)} alt="Попередній перегляд" />
                      <button 
                        type="button" 
                        className="photo-remove-btn"
                        onClick={() => setFormData(prev => ({...prev, photo: null}))}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <input
                    id="service-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              
              <div className="profile-service-modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>Скасувати</button>
                <button 
                  type="button" 
                  onClick={handleSubmit}
                  disabled={!formData.title || !formData.description || !formData.photo}
                >
                  Додати
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showPreview && selectedService && (
        <div className="profile-service-modal" onClick={useCallback(() => setShowPreview(false), [])}>
          <div className="profile-service-modal-content" onClick={useCallback((e) => e.stopPropagation(), [])}>
            <div className="profile-service-modal-header">
              <h3>{selectedService.title}</h3>
              <button onClick={useCallback(() => setShowPreview(false), [])}>×</button>
            </div>
            <div className="service-preview-body">
              {selectedService.photo && (
                <div className="service-preview-image">
                  <img src={selectedService.photo} alt={selectedService.title} />
                </div>
              )}
              <div className="service-preview-info">
                <div className="service-preview-header">
                  <h4>{selectedService.title}</h4>
                  {selectedService.price && (
                    <div className="service-price">{selectedService.price} грн</div>
                  )}
                </div>
                <p className="service-preview-description">{selectedService.description}</p>
                <div className="service-preview-category">
                  {selectedService.category === 'service' ? 'Послуга' : 'Товар'}
                </div>
                
                <div className="preview-actions">
                  <button className="preview-like-btn" onClick={useCallback(() => handleLike(selectedService._id), [])}>
                    👍 {selectedService.likesCount || 0}
                  </button>
                  <button className="preview-dislike-btn" onClick={useCallback(() => handleDislike(selectedService._id), [])}>
                    👎 {selectedService.dislikesCount || 0}
                  </button>
                  <button className="preview-comment-btn" onClick={useCallback(() => handleComment(selectedService._id), [])}>
                    💬 Додати коментар
                  </button>
                </div>
                
                <div className="comments-section">
                  <h5>Коментарі ({selectedService.commentsCount || 0})</h5>
                  {loadingComments ? (
                    <div className="comments-loading">Завантаження...</div>
                  ) : comments.length > 0 ? (
                    <div className="comments-list">
                      {comments.slice(0, 3).map((comment) => (
                        <div key={comment._id} className="comment-item">
                          <div className="comment-text">{comment.text}</div>
                          <div className="comment-date">
                            {new Date(comment.createdAt).toLocaleDateString('uk-UA')}
                          </div>
                        </div>
                      ))}
                      {comments.length > 3 && (
                        <div className="comments-more">+{comments.length - 3} ще...</div>
                      )}
                    </div>
                  ) : (
                    <div className="no-comments">Немає коментарів</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showCommentModal && (
        <div className="profile-service-modal" onClick={useCallback(() => setShowCommentModal(false), [])}>
          <div className="comment-modal-content" onClick={useCallback((e) => e.stopPropagation(), [])}>
            <div className="comment-modal-header">
              <h3>💬 Додати коментар</h3>
              <button onClick={useCallback(() => setShowCommentModal(false), [])}>×</button>
            </div>
            <div className="comment-modal-body">
              <textarea
                placeholder="Напишіть ваш коментар..."
                value={commentText}
                maxLength={500}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
                autoFocus
              />
              <div className="comment-char-counter">{commentText.length}/500</div>
            </div>
            <div className="comment-modal-actions">
              <button 
                className="comment-btn-cancel" 
                onClick={useCallback(() => setShowCommentModal(false), [])}
              >
                Скасувати
              </button>
              <button 
                className="comment-btn-submit" 
                onClick={submitComment}
                disabled={!commentText.trim()}
              >
                Опублікувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;