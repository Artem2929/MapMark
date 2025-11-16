import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ServiceItem.css';

const ServiceItem = ({ service, onDelete, onEdit, isOwnProfile = false }) => {
  const navigate = useNavigate();
  


  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/services/${service._id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        onDelete(service._id);
      }
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleItemClick = (e) => {
    // Prevent navigation if clicking on buttons
    if (e.target.closest('button')) return;
    navigate(`/services?category=${service.category}&serviceItemId=${service._id}`);
  };

  return (
    <div className="service-item" onClick={handleItemClick}>
      {service.photo && (
        <div className="service-item__photo">
          <img src={service.photo} alt={service.title} />
        </div>
      )}
      <div className="service-item__content">
        <h4 className="service-item__title">{service.title}</h4>
        <p className="service-item__description">{service.description}</p>
        <span className="service-item__category">
          {service.category === 'service' ? 'Послуга' : 'Товар'}
        </span>
        <div className="profile-basic-info__actions">
          <button 
            className="profile-basic-info__edit-btn"
            onClick={() => navigate(`/services?category=${service.category}&serviceItemId=${service._id}`)}
          >
            Перейти
          </button>
          {isOwnProfile && (
            <>
              <button 
                className="profile-basic-info__edit-btn"
                onClick={() => onEdit(service)}
              >
                Редагувати
              </button>
              <button 
                className="profile-basic-info__edit-btn"
                onClick={handleDelete}
              >
                Видалити
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceItem;