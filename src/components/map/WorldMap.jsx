import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './WorldMap.css';
import ReviewForm from '../forms/ReviewForm';
import ReviewsPanel from '../ui/ReviewsPanel';

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

  const handleReviewSubmit = (reviewData) => {
    const newReview = {
      ...reviewData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
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

  const getLocationName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const { city, town, village, country, state } = data.address;
        return city || town || village || state || country || 'Unknown Location';
      }
      return 'Unknown Location';
    } catch (error) {
      console.error('Geocoding error:', error);
      return 'Unknown Location';
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
        
        {markers.map((marker) => {
          const markerReviews = reviews.filter(review => review.markerId === marker.id);
          const hasReviews = markerReviews.length > 0;
          
          // Create custom icon for markers with reviews
          const markerProps = {
            key: marker.id,
            position: marker.position
          };
          
          if (hasReviews) {
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
                
                {hasReviews && (() => {
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
                      View Reviews
                    </button>
                  )}
                  <button 
                    className="delete-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMarkers(prev => prev.filter(m => m.id !== marker.id));
                      setReviews(prev => prev.filter(r => r.markerId !== marker.id));
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
        />
      )}
    </div>
  );
};

export default WorldMap;