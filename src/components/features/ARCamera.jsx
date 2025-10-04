import React, { useState, useRef, useEffect } from 'react';
import arService from '../../services/arService';
import './ARCamera.scss';

const ARCamera = ({ places, userLocation, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [arPlaces, setArPlaces] = useState([]);
  const [deviceOrientation, setDeviceOrientation] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    initializeAR();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isActive && places && userLocation) {
      const overlay = arService.createAROverlay(places, userLocation);
      setArPlaces(overlay);
    }
  }, [isActive, places, userLocation, deviceOrientation]);

  const initializeAR = async () => {
    try {
      // Request orientation permission
      const orientationGranted = await arService.requestOrientationPermission();
      if (!orientationGranted) {
        setError('Потрібен дозвіл на орієнтацію пристрою');
        return;
      }

      // Initialize camera
      const stream = await arService.initARCamera();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsActive(true);
      }

      // Listen to device orientation
      window.addEventListener('deviceorientationabsolute', handleOrientation);
      window.addEventListener('deviceorientation', handleOrientation);

    } catch (err) {
      setError(err.message);
    }
  };

  const handleOrientation = (event) => {
    setDeviceOrientation({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma
    });
  };

  const cleanup = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    window.removeEventListener('deviceorientationabsolute', handleOrientation);
    window.removeEventListener('deviceorientation', handleOrientation);
    arService.stopAR();
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    ctx.drawImage(video, 0, 0);

    // Add AR overlay
    const nearestPlace = arPlaces[0];
    if (nearestPlace) {
      const photoData = await arService.captureARPhoto(canvas, nearestPlace);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `mapmark-ar-${Date.now()}.jpg`;
      link.href = photoData;
      link.click();
    }
  };

  if (error) {
    return (
      <div className="ar-camera ar-error">
        <div className="ar-error__message">
          <h3>❌ Помилка AR</h3>
          <p>{error}</p>
          <button onClick={onClose}>Закрити</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ar-camera">
      <video 
        ref={videoRef} 
        className="ar-camera__video"
        playsInline
        muted
      />
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* AR Overlay */}
      <div className="ar-camera__overlay">
        {arPlaces.map(place => (
          <div
            key={place.id}
            className="ar-marker"
            style={{
              left: `${place.arPosition.x}px`,
              top: `${place.arPosition.y}px`,
              color: place.color
            }}
          >
            <div className="ar-marker__content">
              <div className="ar-marker__icon">📍</div>
              <div className="ar-marker__info">
                <div className="ar-marker__name">{place.name}</div>
                <div className="ar-marker__details">
                  ⭐ {place.rating} • {place.distance}m
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AR Controls */}
      <div className="ar-camera__controls">
        <button className="ar-btn ar-btn--close" onClick={onClose}>
          ✕
        </button>
        
        <button className="ar-btn ar-btn--photo" onClick={capturePhoto}>
          📸
        </button>
        
        <div className="ar-camera__compass">
          <div 
            className="ar-camera__compass-needle"
            style={{
              transform: `rotate(${deviceOrientation?.alpha || 0}deg)`
            }}
          >
            🧭
          </div>
        </div>
      </div>

      {/* AR Info Panel */}
      <div className="ar-camera__info-panel">
        <div className="ar-camera__stats">
          <span>📍 {arPlaces.length} місць поблизу</span>
          {deviceOrientation && (
            <span>🧭 {Math.round(deviceOrientation.alpha)}°</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ARCamera;