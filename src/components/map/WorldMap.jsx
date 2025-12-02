import React, { memo, useState, useEffect, useRef } from 'react';
import { classNames } from '../../utils/classNames';
import { useOptimizedState } from '../../hooks/useOptimizedState';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './WorldMap.css';
import ReviewForm from '../forms/ReviewForm';

import MarkerPopup from '../ui/MarkerPopup';
import ReviewsList from '../ui/ReviewsList';
import { getCurrentLocation, getRoute } from '../../services/mapLocationService';
import ReviewService from '../../services/reviewService';
import useReviews from '../../hooks/useReviews';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapClickHandler = ({ onMapClick }) => {
  const map = useMapEvents({
    click: (e) => {
      onMapClick(e.latlng, e.originalEvent);
    },
  });
  return null;
};

const MarkerComponent = React.memo(({ marker, markerReviews, hasReviews, map, setMarkerPopup }) => {
  return (
    <Marker 
      position={marker.position}
      eventHandlers={{
        click: () => {
          if (map) {
            const markerPoint = map.latLngToContainerPoint(marker.position);
            const mapContainer = map.getContainer().getBoundingClientRect();
            
            const x = mapContainer.left + markerPoint.x + 30;
            const y = mapContainer.top + markerPoint.y - 10;
            
            setMarkerPopup({
              x,
              y,
              marker,
              reviews: markerReviews
            });
          }
        }
      }}
    >
      <Popup>
        <div>
          <strong>{marker.name}</strong><br/>
          Відгуків: {markerReviews.length}
        </div>
      </Popup>
    </Marker>
  );
});

const WorldMap = ({ searchQuery, onMapReady, filters, onReviewFormToggle, onReviewSubmit }) => {
  const { t } = useTranslation();

  const [map, setMap] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const { reviews, addReview } = useReviews();

  // Create markers from reviews - group by location
  const markers = React.useMemo(() => {
    if (reviews.length === 0) return [];
    
    const locationGroups = {};
    
    reviews.forEach(review => {
      const key = `${review.lat.toFixed(4)}_${review.lng.toFixed(4)}`;
      if (!locationGroups[key]) {
        locationGroups[key] = {
          id: key,
          position: [review.lat, review.lng],
          name: `Місце з відгуками`,
          hasReviews: true,
          isTemp: false,
          reviewCount: 0
        };
      }
      locationGroups[key].reviewCount++;
    });
    
    return Object.values(locationGroups);
  }, [reviews]);
  const [expandedPopup, setExpandedPopup] = useState(null);
  const [userReviewCount, setUserReviewCount] = useState(0);

  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [tempMarker, setTempMarker] = useState(null);
  const tempMarkerRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [contextSearchQuery, setContextSearchQuery] = useState('');
  const [markerPopup, setMarkerPopup] = useState(null);
  const [showReviewsList, setShowReviewsList] = useState(false);
  const [selectedMarkerForReviews, setSelectedMarkerForReviews] = useState(null);
  const [searchPlaceholder, setSearchPlaceholder] = useState('🔍 Пошук місця');

  const handleReviewSubmit = async (reviewData) => {
    onReviewFormToggle?.(false);
    try {
      // The review has already been submitted to the backend in ReviewForm
      // Just update the local state for immediate UI feedback
      const newReview = {
        ...reviewData,
        id: reviewData._id || Date.now(),
        timestamp: reviewData.createdAt || new Date().toISOString(),
        markerId: selectedMarker.id
      };
      
      addReview(newReview);
      onReviewSubmit?.();
      
      // Прибираємо тимчасовий маркер
      if (selectedMarker.isTemp) {
        setTempMarker(null);
      }
      
      // Close review form
      setShowReviewForm(false);
      

      
      setSelectedMarker(null);
      console.log('Review submitted:', newReview);
    } catch (error) {
      console.error('Error handling review submission:', error);
    }
  };

  const flyToCountry = (coords) => {
    console.log('flyToCountry called with:', coords, 'map:', map);
    if (map && coords && coords.length === 2) {
      console.log('Flying to:', [coords[0], coords[1]]);
      map.flyTo([coords[0], coords[1]], 6, {
        duration: 1.5
      });
    }
  };

  // Pass map instance to parent
  React.useEffect(() => {
    console.log('Setting map instance:', map);
    if (onMapReady && map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  const formatLocationName = (displayName) => {
    if (!displayName) return 'Невідоме місце';
    
    const parts = displayName.split(', ');
    // Беремо перші 2-3 частини адреси (номер будинку, вулиця, район/місто)
    const shortName = parts.slice(0, 3).join(', ');
    return shortName || displayName;
  };

  const getLocationName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const { 
          house_number, 
          road, 
          city, 
          town, 
          village, 
          suburb, 
          neighbourhood,
          state, 
          country 
        } = data.address;
        
        // Формуємо детальну адресу
        let address = '';
        
        // Місто
        const cityName = city || town || village || suburb || neighbourhood;
        if (cityName) {
          address += `м. ${cityName}`;
        }
        
        // Вулиця та номер будинку
        if (road) {
          address += address ? `, вул. ${road}` : `вул. ${road}`;
          if (house_number) {
            address += ` ${house_number}`;
          }
        }
        
        // Якщо немає детальної адреси, використовуємо область/країну
        if (!address) {
          address = state || country || 'Невідоме місце';
        }
        
        return formatLocationName(address);
      }
      return 'Невідоме місце';
    } catch (error) {
      console.error('Geocoding error:', error);
      return 'Невідоме місце';
    }
  };

  const handleMapClick = async (latlng, originalEvent) => {
    // Закриваємо попереднє контекстне меню
    setContextMenu(null);
    setTempMarker(null);
    
    const locationName = await getLocationName(latlng.lat, latlng.lng);
    const newTempMarker = {
      id: `temp-${Date.now()}`,
      position: [latlng.lat, latlng.lng],
      name: locationName,
      hasReviews: false,
      isTemp: true
    };
    setTempMarker(newTempMarker);
    
    // Отримуємо позицію маркера на екрані
    setTimeout(() => {
      if (map) {
        const markerPoint = map.latLngToContainerPoint(latlng);
        const mapContainer = map.getContainer().getBoundingClientRect();
        
        const x = mapContainer.left + markerPoint.x + 20; // Зміщення праворуч від маркера
        const y = mapContainer.top + markerPoint.y - 15; // Мінімальний офсет вгору
        
        // Перевіряємо, чи меню не виходить за межі екрану
        const menuWidth = 200;
        const menuHeight = 150;
        const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth - 40 : x;
        const adjustedY = y < menuHeight ? y + 40 : y; // Якщо зверху немає місця, показуємо знизу
        
        setContextMenu({
          x: adjustedX,
          y: adjustedY,
          marker: newTempMarker
        });
      }
    }, 50);
  };

  const searchLocation = async (query) => {
    if (!query) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latlng = [parseFloat(lat), parseFloat(lon)];
        
        // Створюємо тимчасовий маркер
        const newTempMarker = {
          id: `search-${Date.now()}`,
          position: latlng,
          name: formatLocationName(display_name),
          hasReviews: false,
          isTemp: true
        };
        setTempMarker(newTempMarker);
        
        // Fly to location
        if (map) {
          map.flyTo(latlng, 15);
          
          // Показуємо контекстне меню після перельоту
          setTimeout(() => {
            const markerPoint = map.latLngToContainerPoint(latlng);
            const mapContainer = map.getContainer().getBoundingClientRect();
            
            const x = mapContainer.left + markerPoint.x + 20;
            const y = mapContainer.top + markerPoint.y - 15;
            
            const menuWidth = 200;
            const menuHeight = 150;
            const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth - 40 : x;
            const adjustedY = y < menuHeight ? y + 40 : y;
            
            setContextMenu({
              x: adjustedX,
              y: adjustedY,
              marker: newTempMarker
            });
          }, 1000); // Чекаємо поки завершиться анімація перельоту
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Effect to handle search from header
  React.useEffect(() => {
    if (searchQuery) {
      searchLocation(searchQuery);
    }
  }, [searchQuery]);

  // Effect to handle filters
  React.useEffect(() => {
    if (filters && filters.country) {
      console.log('Filtering by country:', filters.country);
      // Фільтруємо маркери по країні якщо потрібно
    }
  }, [filters]);

  // Function to update context menu position
  const updateContextMenuPosition = () => {
    if (contextMenu && map && tempMarker) {
      const markerPoint = map.latLngToContainerPoint(tempMarker.position);
      const mapContainer = map.getContainer().getBoundingClientRect();
      
      const x = mapContainer.left + markerPoint.x + 20;
      const y = mapContainer.top + markerPoint.y - 15;
      
      const menuWidth = 200;
      const menuHeight = 150;
      const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth - 40 : x;
      const adjustedY = y < menuHeight ? y + 40 : y;
      
      setContextMenu(prev => ({
        ...prev,
        x: adjustedX,
        y: adjustedY
      }));
    }
  };

  // Effect to close context menu and marker popup on outside click
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu && !event.target.closest('.map-context-menu')) {
        setContextMenu(null);
        setTempMarker(null);
      }
      if (markerPopup && !event.target.closest('.marker-popup')) {
        setMarkerPopup(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu, markerPopup]);

  // Effect to update menu position on zoom/pan
  React.useEffect(() => {
    if (map && contextMenu) {
      const handleMapMove = () => {
        updateContextMenuPosition();
      };
      
      map.on('zoom', handleMapMove);
      map.on('move', handleMapMove);
      
      return () => {
        map.off('zoom', handleMapMove);
        map.off('move', handleMapMove);
      };
    }
  }, [map, contextMenu, tempMarker]);

  const findMyLocation = async () => {
    console.log('findMyLocation called');
    try {
      console.log('Getting current location...');
      const location = await getCurrentLocation();
      console.log('Location received:', location);
      setUserLocation(location);
      
      if (map) {
        console.log('Flying to location:', [location.lat, location.lng]);
        map.flyTo([location.lat, location.lng], 19, {
          duration: 2.5
        });
      } else {
        console.log('Map not available');
      }
    } catch (error) {
      console.error('Location error:', error);
      alert('Не вдалося визначити вашу позицію');
    }
  };

  const buildRoute = async (destination) => {
    if (!userLocation) {
      alert('Спочатку визначте вашу позицію');
      return;
    }
    
    try {
      const route = await getRoute(userLocation, {
        lat: destination.position[0],
        lng: destination.position[1]
      });
      
      const leafletCoords = route.coordinates.map(coord => [coord[1], coord[0]]);
      setRouteCoordinates(leafletCoords);
      
      console.log(`Маршрут: ${(route.distance / 1000).toFixed(1)} км, ${Math.round(route.duration / 60)} хв`);
    } catch (error) {
      console.error('Route error:', error);
      alert('Не вдалося побудувати маршрут');
    }
  };

  // Animated placeholder effect
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSearchPlaceholder(prev => {
        if (prev === '🔍 Пошук місця') return '🔍 Пошук місця.';
        if (prev === '🔍 Пошук місця.') return '🔍 Пошук місця..';
        if (prev === '🔍 Пошук місця..') return '🔍 Пошук місця...';
        return '🔍 Пошук місця';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  // Виставляємо функцію в window для доступу з QuickFilter
  React.useEffect(() => {
    window.findMyLocation = findMyLocation;
    return () => {
      delete window.findMyLocation;
    };
  }, []);

  return (
    <div className="world-map-container">
      <MapContainer
        center={[20, 0]}
        zoom={3}
        minZoom={2}
        maxZoom={18}
        worldCopyJump={true}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        whenReady={(mapEvent) => {
          console.log('Map ready:', mapEvent.target);
          setMap(mapEvent.target);
          if (onMapReady) {
            onMapReady(mapEvent.target);
          }
        }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />
        <MapClickHandler onMapClick={handleMapClick} />
        
        {/* Постійні маркери */}
        {markers.map((marker) => {
          const markerReviews = reviews.filter(review => {
            const reviewKey = `${review.lat.toFixed(4)}_${review.lng.toFixed(4)}`;
            return reviewKey === marker.id;
          });
          const hasReviews = marker.hasReviews || markerReviews.length > 0;
          
          return (
            <MarkerComponent
              key={marker.id}
              marker={marker}
              markerReviews={markerReviews}
              hasReviews={hasReviews}
              map={map}
              setMarkerPopup={setMarkerPopup}
            />
          );
        })}
        
        {/* Тимчасовий маркер */}
        {tempMarker && (
          <Marker key={tempMarker.id} position={tempMarker.position} ref={tempMarkerRef} />
        )}
        
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              html: '📍',
              className: 'user-location-icon',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>Ваша позиція</Popup>
          </Marker>
        )}
        
        {routeCoordinates.length > 0 && (
          <Polyline 
            positions={routeCoordinates}
            color="#007aff"
            weight={4}
            opacity={0.8}
          />
        )}
      </MapContainer>
      

      
      {showReviewForm && selectedMarker && (
        <ReviewForm
          marker={selectedMarker}
          onClose={() => {
            setShowReviewForm(false);
            setSelectedMarker(null);
            onReviewFormToggle?.(false);
          }}
          onSubmit={handleReviewSubmit}
        />
      )}
      

      
      {/* Контекстне меню */}
      {contextMenu && (
        <div 
          className="map-context-menu"
          style={{
            left: contextMenu.x,
            top: contextMenu.y
          }}
        >
          <div className="context-menu-header">
            <div className="context-menu-title">{contextMenu.marker.name}</div>
            <div className="context-menu-coords">
              {contextMenu.marker.position[0].toFixed(4)}, {contextMenu.marker.position[1].toFixed(4)}
            </div>
          </div>
          
          <div className="context-menu-search">
            <input
              type="text"
              className="context-menu-search-input"
              placeholder={searchPlaceholder}
              value={contextSearchQuery}
              onChange={(e) => setContextSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && contextSearchQuery.trim()) {
                  searchLocation(contextSearchQuery);
                  setContextMenu(null);
                  setTempMarker(null);
                  setContextSearchQuery('');
                }
              }}
              autoFocus
            />
          </div>
          
          <button 
            className="context-menu-item"
            onClick={() => {
              setSelectedMarker(contextMenu.marker);
              setShowReviewForm(true);
              onReviewFormToggle?.(true);
              setContextMenu(null);
            }}
          >
            <span className="context-menu-item-icon">📝</span>
            <span className="context-menu-item-text">{t('popup.addReview')}</span>
          </button>
          
          {userLocation && (
            <button 
              className="context-menu-item"
              onClick={() => {
                buildRoute(contextMenu.marker);
                setContextMenu(null);
              }}
            >
              <span className="context-menu-item-icon">🗺️</span>
              <span className="context-menu-item-text">Маршрут</span>
            </button>
          )}
          
          <button 
            className="context-menu-item"
            onClick={() => {
              setContextMenu(null);
              setTempMarker(null);
            }}
          >
            <span className="context-menu-item-icon">✕</span>
            <span className="context-menu-item-text">Закрити</span>
          </button>
        </div>
      )}
      
      {/* Marker Popup */}
      {markerPopup && (
        <div 
          style={{
            position: 'fixed',
            left: markerPopup.x,
            top: markerPopup.y,
            zIndex: 1001
          }}
        >
          <MarkerPopup
            marker={markerPopup.marker}
            reviews={markerPopup.reviews}
            onAddReview={() => {
              setSelectedMarker(markerPopup.marker);
              setShowReviewForm(true);
              onReviewFormToggle?.(true);
              setMarkerPopup(null);
            }}
            onViewReviews={() => {
              setSelectedMarkerForReviews(markerPopup.marker);
              setShowReviewsList(true);
              setMarkerPopup(null);
            }}
            onBuildRoute={() => {
              buildRoute(markerPopup.marker);
              setMarkerPopup(null);
            }}
            onDelete={() => {
              // Маркери тепер автоматично оновлюються через useMemo
              setMarkerPopup(null);
            }}
          />
        </div>
      )}
      
      {/* Reviews List */}
      {showReviewsList && selectedMarkerForReviews && (
        <div className={`reviews-list-overlay ${showReviewsList ? 'visible' : ''}`}>
          <ReviewsList
            marker={selectedMarkerForReviews}
            onClose={() => {
              setShowReviewsList(false);
              setSelectedMarkerForReviews(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default WorldMap;