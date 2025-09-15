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
      // Zoom in to clicked location
      map.flyTo(e.latlng, Math.min(map.getZoom() + 2, 18), {
        duration: 0.5
      });
    },
  });
  return null;
};

const WorldMap = ({ searchQuery, onMapReady }) => {
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
    setShowReviewForm(false);
    setSelectedMarker(null);
    setExpandedPopup(selectedMarker.id); // Автоматично розкриваємо popup
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

  const handleMapClick = (latlng) => {
    const newMarker = {
      id: Date.now(),
      position: [latlng.lat, latlng.lng],
      name: t('popup.location') + ' 1'
    };
    setMarkers([newMarker]);
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
          name: display_name
        };
        setMarkers([newMarker]);
        
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
        
        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position}>
            <Popup>
              <div 
                className={`popup-content ${expandedPopup === marker.id ? 'expanded' : ''}`}
                style={expandedPopup === marker.id ? {
                  maxHeight: 'none',
                  overflow: 'visible'
                } : {}}
              >
                <strong>{marker.name}</strong>
                <br />
                <div style={{marginBottom: '12px'}}>
                  {t('popup.coordinates').replace('{lat}', marker.position[0].toFixed(4)).replace('{lng}', marker.position[1].toFixed(4))}
                </div>
                
                {!expandedPopup || expandedPopup !== marker.id ? (
                  <div style={{marginTop: '12px', marginBottom: '16px'}}>
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
                    <button 
                      className="expand-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedMarkerForReviews(marker);
                        setShowReviewsPanel(true);
                      }}
                    >
                      Show more
                    </button>
                  </div>
                ) : null}

              </div>
            </Popup>
          </Marker>
        ))}
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
      
      <ReviewsPanel
        marker={selectedMarkerForReviews}
        reviews={reviews}
        isVisible={showReviewsPanel}
        onClose={() => {
          setShowReviewsPanel(false);
          setSelectedMarkerForReviews(null);
        }}
        onAddReview={() => {
          setSelectedMarker(selectedMarkerForReviews);
          setShowReviewForm(true);
        }}
      />
    </div>
  );
};

export default WorldMap;