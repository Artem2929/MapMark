import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ServiceItem.css';

const ServiceItem = ({ service, onDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/services/${service._id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        onDelete(service._id);
      }
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  return (
    <div className="service-item">
      {service.photo && (
        <div className="service-item__photo">
          <img src={service.photo} alt={service.title} />
        </div>
      )}
      <div className="service-item__content">
        <h4 className="service-item__title">{service.title}</h4>
        <p className="service-item__description">{service.description}</p>
        <span className="add-service-btn">
          {service.category === 'service' ? 'Послуга' : 'Товар'}
        </span>
        <div className="profile-basic-info__actions">
          <button 
            className="btn btn--primary btn--sm"
            onClick={() => navigate(`/services?category=${service.category}`)}
          >
            Перейти
          </button>
          <button 
            className="btn btn--secondary btn--sm"
            onClick={handleDelete}
          >
            Видалити
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceItem;