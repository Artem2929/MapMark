import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './UserMap.css';

const UserMap = ({ userId }) => {
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([50.4501, 30.5234]); // Київ за замовчуванням

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/user/${userId}/reviews`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          const reviews = data.data;
          setUserReviews(reviews);
          
          // Встановлюємо центр карти на основі першого відгуку
          if (reviews[0].lat && reviews[0].lng) {
            setMapCenter([reviews[0].lat, reviews[0].lng]);
          }
        }
      } catch (error) {
        console.error('Error fetching user reviews for map:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserReviews();
    }
  }, [userId]);

  // Створюємо кастомну іконку для маркерів
  const createCustomIcon = (rating) => {
    const color = rating >= 4 ? '#10b981' : rating >= 3 ? '#f59e0b' : '#ef4444';
    return L.divIcon({
      html: `
        <div style="
          background: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: white;
          font-weight: bold;
        ">
          ${rating}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  if (loading) {
    return (
      <div className="user-map loading">
        <div className="loading-spinner"></div>
        <p>Завантаження карти...</p>
      </div>
    );
  }

  if (userReviews.length === 0) {
    return (
      <div className="user-map empty">
        <div className="empty-icon">🗺️</div>
        <p>Поки що немає відміток на карті</p>
      </div>
    );
  }

  return (
    <div className="user-map">
      <h3>Карта відвіданих місць ({userReviews.length})</h3>
      
      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={6}
          style={{ height: '300px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {userReviews.map((review) => (
            review.lat && review.lng && (
              <Marker
                key={review._id}
                position={[review.lat, review.lng]}
                icon={createCustomIcon(review.rating)}
              >
                <Popup>
                  <div className="review-popup">
                    <div className="popup-rating">
                      {'⭐'.repeat(review.rating)}
                    </div>
                    <div className="popup-text">{review.text}</div>
                    <div className="popup-date">
                      {new Date(review.createdAt).toLocaleDateString('uk-UA')}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
      
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#10b981' }}></div>
          <span>Високі оцінки (4-5)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#f59e0b' }}></div>
          <span>Середні оцінки (3)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#ef4444' }}></div>
          <span>Низькі оцінки (1-2)</span>
        </div>
      </div>
    </div>
  );
};

export default UserMap;