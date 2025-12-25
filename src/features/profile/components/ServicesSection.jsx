import React from 'react'

const ServicesSection = ({ userId, isOwnProfile, services, onServiceAdded }) => {
  return (
    <div className="services-section">
      <h2>Послуги</h2>
      {isOwnProfile && (
        <button onClick={() => onServiceAdded({ id: Date.now(), name: 'Нова послуга' })}>
          Додати послугу
        </button>
      )}
      <div className="services-list">
        {services.length === 0 ? (
          <p>Послуги відсутні</p>
        ) : (
          services.map(service => (
            <div key={service.id} className="service-item">
              {service.name}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ServicesSection