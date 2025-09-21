import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './WorldMap.css';
import ReviewForm from '../forms/ReviewForm';
import ReviewsPanel from '../ui/ReviewsPanel';
import { getCurrentLocation, getRoute } from './LocationService';
import ReviewService from '../../services/reviewService';

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
      onMapClick(e.latlng);
    },
  });
  return null;
};

const WorldMap = ({ searchQuery, onMapReady, filters }) => {
  const { t } = useTranslation();
  const [markers, setMarkers] = useState([]);
  const [map, setMap] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [expandedPopup, setExpandedPopup] = useState(null);
  const [showReviewsPanel, setShowReviewsPanel] = useState(false);
  const [selectedMarkerForReviews, setSelectedMarkerForReviews] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);

  // Load reviews from API on component mount (only once)
  useEffect(() => {
    loadReviews();
  }, []); // Empty dependency array ensures this runs only once

  const loadReviews = async () => {
    setIsLoadingReviews(true);
    setReviewsError(null);
    
    try {
      // Try to fetch from API first
      let reviewsData;
      try {
        reviewsData = await ReviewService.getAllReviews();
      } catch (apiError) {
        console.warn('API not available, using mock data for testing:', apiError.message);
        // Fallback to mock data for testing
        reviewsData = [
          {
            _id: '507f1f77bcf86cd799439011',
            lat: 50.4501,
            lng: 30.5234,
            review: 'Amazing place with great atmosphere!',
            rating: 5,
            createdAt: new Date().toISOString(),
            photos: [
              {
                id: 'mock-photo-1',
                base64: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjBGMEYwIi8+CjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjE1IiBmaWxsPSIjQ0NDQ0NDIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5GAPC90ZXh0Pgo8L3N2Zz4K'
              }
            ]
          },
          {
            _id: '507f1f77bcf86cd799439012',
            lat: 40.7128,
            lng: -74.0060,
            review: 'Beautiful location, highly recommended!',
            rating: 4,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            photos: []
          },
          {
            _id: '507f1f77bcf86cd799439013',
            lat: 51.5074,
            lng: -0.1278,
            review: 'Great experience, will come back again.',
            rating: 5,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            photos: [
              {
                id: 'mock-photo-2',
                base64: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjBGMEYwIi8+CjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjE1IiBmaWxsPSIjQ0NDQ0NDIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5GAPC90ZXh0Pgo8L3N2Zz4K'
              },
              {
                id: 'mock-photo-3',
                base64: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjBGMEYwIi8+CjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjE1IiBmaWxsPSIjQ0NDQ0NDIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5GAPC90ZXh0Pgo8L3N2Zz4K'
              }
            ]
          }
        ];
      }
      
      setReviews(reviewsData);
      
      // Convert reviews to markers for display on map
      const reviewMarkers = reviewsData.map(review => ({
        id: review._id || review.id || `review-${Date.now()}-${Math.random()}`,
        position: [review.lat, review.lng],
        name: `Review at ${review.lat.toFixed(4)}, ${review.lng.toFixed(4)}`,
        hasReviews: true,
        isReviewMarker: true,
        reviewData: review
      }));
      
      setMarkers(prev => {
        // Filter out existing review markers and add new ones
        const nonReviewMarkers = prev.filter(marker => !marker.isReviewMarker);
        return [...nonReviewMarkers, ...reviewMarkers];
      });
      
      console.log(`Loaded ${reviewsData.length} reviews and created ${reviewMarkers.length} markers`);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviewsError(error.message || 'Failed to load reviews');
    } finally {
      setIsLoadingReviews(false);
    }
  };


  const handleReviewDeleted = (deletedReviewId) => {
    console.log('handleReviewDeleted called with ID:', deletedReviewId);
    
    ReviewService.deleteReview(deletedReviewId).then(() => {
      setReviews(prev => prev.filter(review => review._id !== deletedReviewId));
      setMarkers(prev => prev.filter(marker => marker.id !== deletedReviewId));
      setSelectedMarker(null);
    }).catch(error => {
      console.error('Error deleting review:', error);
    });
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      // The review has already been submitted to the backend in ReviewForm
      // Just update the local state for immediate UI feedback
      const newReview = {
        ...reviewData,
        id: reviewData._id || Date.now(),
        timestamp: reviewData.createdAt || new Date().toISOString(),
        markerId: selectedMarker.id
      };
      
      setReviews(prev => [...prev, newReview]);
      
      // Update marker to show it has reviews
      setMarkers(prev => prev.map(marker => 
        marker.id === selectedMarker.id 
          ? { ...marker, hasReviews: true }
          : marker
      ));
      
      // Close review form
      setShowReviewForm(false);
      
      // If reviews panel was open, keep it open and update the selected marker
      if (showReviewsPanel && selectedMarkerForReviews?.id === selectedMarker.id) {
        // Panel stays open, just update the marker reference
        setSelectedMarkerForReviews(prev => ({ ...prev, hasReviews: true }));
      }
      
      setSelectedMarker(null);
      console.log('Review submitted:', newReview);
    } catch (error) {
      console.error('Error handling review submission:', error);
    }
  };

  const handleDeletePhoto = async (reviewId, photoId) => {
    console.log('Attempting to delete photo with ID:', photoId, 'from review:', reviewId);
    
    if (!reviewId || !photoId) {
      alert('Invalid review ID or photo ID. Cannot delete photo.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    setDeletingPhotoId(photoId);
    try {
      console.log('Calling ReviewService.deletePhoto with review ID:', reviewId, 'and photo ID:', photoId);
      
      // Check if this is a mock review (starts with '507f1f77bcf86cd7994390')
      if (reviewId.startsWith('507f1f77bcf86cd7994390')) {
        console.log('Mock review detected, deleting photo locally only');
        // For mock reviews, just update local state
        setReviews(prev => prev.map(review => {
          if ((review._id || review.id) === reviewId) {
            // Remove the photo from the review
            const updatedPhotos = review.photos?.filter(photo => photo.id !== photoId) || [];
            return { ...review, photos: updatedPhotos };
          }
          return review;
        }));
      } else {
        // For real reviews, call the API
        await ReviewService.deletePhoto(reviewId, photoId);
        console.log('Photo deleted successfully from API');
        
        // Update local state to remove the photo
        setReviews(prev => prev.map(review => {
          if ((review._id || review.id) === reviewId) {
            // Remove the photo from the review
            const updatedPhotos = review.photos?.filter(photo => photo.id !== photoId) || [];
            return { ...review, photos: updatedPhotos };
          }
          return review;
        }));
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert(`Failed to delete photo: ${error.message}`);
    } finally {
      setDeletingPhotoId(null);
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

  // Pass map instance to parent and refresh reviews when map is ready
  React.useEffect(() => {
    console.log('Setting map instance:', map);
    if (onMapReady && map) {
      onMapReady(map);
    }
    
    // Refresh reviews when map is ready to ensure they're displayed
    if (map && reviews.length === 0) {
      loadReviews();
    }
  }, [map, onMapReady]);

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
        
        return address;
      }
      return 'Невідоме місце';
    } catch (error) {
      console.error('Geocoding error:', error);
      return 'Невідоме місце';
    }
  };

  const handleMapClick = async (latlng) => {
    const locationName = await getLocationName(latlng.lat, latlng.lng);
    const newMarker = {
      id: Date.now(),
      position: [latlng.lat, latlng.lng],
      name: locationName,
      hasReviews: false
    };
    setMarkers(prev => [...prev, newMarker]);
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
        const newMarker = {
          id: Date.now(),
          position: [parseFloat(lat), parseFloat(lon)],
          name: display_name,
          hasReviews: false
        };
        setMarkers(prev => [...prev, newMarker]);
        
        // Fly to location
        if (map) {
          map.flyTo([parseFloat(lat), parseFloat(lon)], 10);
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

  // Виставляємо функцію в window для доступу з QuickFilter
  React.useEffect(() => {
    window.findMyLocation = findMyLocation;
    return () => {
      delete window.findMyLocation;
    };
  }, []);

  return (
    <div className="world-map-container">
      {/* Loading indicator for reviews */}
      {isLoadingReviews && (
        <div className="reviews-loading-indicator">
          <div className="loading-spinner"></div>
          <span>Loading reviews...</span>
        </div>
      )}
      
      {/* Error message for reviews */}
      {reviewsError && (
        <div className="reviews-error-message">
          <div className="error-icon">⚠️</div>
          <span>{reviewsError}</span>
          <button 
            className="retry-btn"
            onClick={loadReviews}
          >
            Retry
          </button>
        </div>
      )}
      
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
        
        {markers.map((marker) => {
          // For review markers, use the review data directly
          // For location markers, they have their own data
          // For regular markers, find associated reviews
          let markerReviews = [];
          let hasReviews = false;
          
          if (marker.isReviewMarker) {
            // This is a review marker, use its review data
            markerReviews = [marker.reviewData];
            hasReviews = true;
          } else if (marker.isLocationMarker) {
            // This is a location marker, it has its own data
            markerReviews = [];
            hasReviews = false;
          } else {
            // This is a regular marker, find reviews by marker ID
            markerReviews = reviews.filter(review => review.markerId === marker.id);
            hasReviews = markerReviews.length > 0;
          }
          
          // Create custom icon for markers with reviews
          const markerProps = {
            key: marker.id,
            position: marker.position
          };
          
          if (hasReviews) {
            // Different icons for review markers vs regular markers with reviews
            if (marker.isReviewMarker) {
              markerProps.icon = L.divIcon({
                html: `
                  <div class="review-badge review-marker">
                    <div class="badge-circle">
                      <div class="badge-icon">⭐</div>
                    </div>
                    <div class="badge-count">${markerReviews[0].rating}</div>
                    <div class="badge-glow"></div>
                  </div>
                `,
                className: 'review-marker-icon',
                iconSize: [28, 36],
                iconAnchor: [3, 36]
              });
            } else {
              markerProps.icon = L.divIcon({
                html: `
                  <div class="review-badge">
                    <div class="badge-circle">
                      <div class="badge-icon">📝</div>
                    </div>
                    <div class="badge-count">${markerReviews.length}</div>
                    <div class="badge-glow"></div>
                  </div>
                `,
                className: 'game-flag-icon',
                iconSize: [28, 36],
                iconAnchor: [3, 36]
              });
            }
          } else if (marker.isLocationMarker) {
            // Location markers have a different icon
            markerProps.icon = L.divIcon({
              html: `
                <div class="location-badge">
                  <div class="badge-circle">
                    <div class="badge-icon">📍</div>
                  </div>
                  <div class="badge-glow"></div>
                </div>
              `,
              className: 'location-marker-icon',
              iconSize: [24, 32],
              iconAnchor: [3, 32]
            });
          }
          
          return (
            <Marker {...markerProps}>
              <Popup>
              <div 
                className={`popup-content ${expandedPopup === marker.id ? 'expanded' : ''}`}
                style={expandedPopup === marker.id ? {
                  maxHeight: 'none',
                  overflow: 'visible'
                } : {}}
              >
                <strong>{marker.name}</strong>
                <div style={{marginBottom: '8px', fontSize: '12px', color: '#8e8e93'}}>
                  {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}
                </div>
                
                {marker.isReviewMarker && markerReviews[0] && (
                  <div className="review-content" style={{marginBottom: '8px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px'}}>
                    <div style={{fontSize: '14px', marginBottom: '4px'}}>
                      <strong>Review:</strong> {markerReviews[0].review}
                    </div>
                    <div style={{fontSize: '12px', color: '#666'}}>
                      Rating: {'⭐'.repeat(markerReviews[0].rating)} ({markerReviews[0].rating}/5)
                    </div>
                    {markerReviews[0].createdAt && (
                      <div style={{fontSize: '10px', color: '#999', marginTop: '4px'}}>
                        {new Date(markerReviews[0].createdAt).toLocaleDateString()}
                      </div>
                    )}
                    {markerReviews[0].photos && markerReviews[0].photos.length > 0 && (
                      <div className="review-photos">
                        <div className="review-photos-title">
                          Photos ({markerReviews[0].photos.length}):
                        </div>
                        <div className="review-photos-grid">
                          {markerReviews[0].photos.map((photo, index) => (
                            <div key={index} className="popup-photo-container">
                              <img
                                src={photo.base64}
                                alt={`Review photo ${index + 1}`}
                                className="review-photo"
                                onClick={() => {
                                  // Open photo in new tab for full view
                                  const newWindow = window.open();
                                  newWindow.document.write(`
                                    <html>
                                      <head><title>Review Photo</title></head>
                                      <body style="margin:0; padding:20px; background:#000; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                                        <img src="${photo.base64}" style="max-width:100%; max-height:100%; border-radius:8px;" />
                                      </body>
                                    </html>
                                  `);
                                }}
                              />
                              <button
                                className="popup-delete-photo-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeletePhoto(markerReviews[0]._id || markerReviews[0].id, photo.id || index);
                                }}
                                disabled={deletingPhotoId === (photo.id || index)}
                                title="Delete photo"
                              >
                                {deletingPhotoId === (photo.id || index) ? '⏳' : '×'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {marker.isLocationMarker && (
                  <div className="location-content" style={{marginBottom: '8px', padding: '8px', backgroundColor: '#e3f2fd', borderRadius: '4px'}}>
                    <div style={{fontSize: '14px', marginBottom: '4px'}}>
                      <strong>Location:</strong> {marker.name}
                    </div>
                    {marker.rating && (
                      <div style={{fontSize: '12px', color: '#666'}}>
                        Rating: {'⭐'.repeat(marker.rating)} ({marker.rating}/5)
                      </div>
                    )}
                    {marker.author && (
                      <div style={{fontSize: '10px', color: '#999', marginTop: '4px'}}>
                        By: {marker.author}
                      </div>
                    )}
                  </div>
                )}
                
                {hasReviews && !marker.isReviewMarker && (() => {
                  const avgRating = markerReviews.reduce((sum, review) => sum + review.rating, 0) / markerReviews.length;
                  const roundedRating = Math.round(avgRating);
                  const stars = '⭐'.repeat(roundedRating);
                  
                  return (
                    <div className="reviews-badge">
                      <span className="reviews-stars">{stars}</span>
                      <span className="reviews-rating">{avgRating.toFixed(1)}</span>
                      <span className="reviews-count">({markerReviews.length})</span>
                    </div>
                  );
                })()}
                
                <div style={{marginTop: '8px', marginBottom: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                  {!marker.isReviewMarker && !marker.isLocationMarker && (
                    <button 
                      className="review-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedMarker(marker);
                        setShowReviewForm(true);
                      }}
                    >
                      {t('popup.addReview')}
                    </button>
                  )}
                  {markerReviews.length > 0 && (
                    <button 
                      className="expand-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('View Reviews clicked', marker, markerReviews);
                        setSelectedMarkerForReviews(marker);
                        setShowReviewsPanel(true);
                      }}
                    >
                      {marker.isReviewMarker ? 'View Review' : 'View Reviews'}
                    </button>
                  )}
                  <button 
                    className="route-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      buildRoute(marker);
                    }}
                  >
                    🗺️
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReviewDeleted(markerReviews[0]._id || markerReviews[0].id);
                    }}
                  >
                    🗑️
                  </button>
                </div>

              </div>
              </Popup>
            </Marker>
          );
        })}
        
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
          }}
          onSubmit={handleReviewSubmit}
        />
      )}
      
      {showReviewsPanel && selectedMarkerForReviews && (
        <ReviewsPanel
          marker={selectedMarkerForReviews}
          reviews={reviews}
          onClose={() => {
            setShowReviewsPanel(false);
            setSelectedMarkerForReviews(null);
          }}
          onAddReview={() => {
            setSelectedMarker(selectedMarkerForReviews);
            setShowReviewForm(true);
          }}
          onReviewDeleted={handleReviewDeleted}
        />
      )}
    </div>
  );
};

export default WorldMap;