import React from 'react'

const ServicesSection = ({ userId, isOwnProfile, services = [], onServiceAdded }) => {
  const handleAddService = () => {
    // TODO: Replace with proper API call to create service
    if (onServiceAdded) {
      onServiceAdded({
        name: 'Нова послуга',
        userId
      })
    }
  }

  return (
    <div className="services-section">
      <h2>Послуги</h2>
      {isOwnProfile && (
        <button onClick={handleAddService}>
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