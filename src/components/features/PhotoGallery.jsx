import React, { useState } from 'react';
import './PhotoGallery.css';

const PhotoGallery = ({ photos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToPhoto = (index) => {
    setCurrentIndex(index);
  };

  const handleSwipe = (e) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    
    const handleTouchEnd = (endEvent) => {
      const endX = endEvent.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextPhoto();
        } else {
          prevPhoto();
        }
      }
      
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div className="photo-gallery">
      <div className="main-photo-container">
        <div 
          className="main-photo"
          onTouchStart={handleSwipe}
          onClick={() => setIsFullscreen(true)}
        >
          <img 
            src={photos[currentIndex]} 
            alt={`Фото ${currentIndex + 1}`}
            className="main-image"
          />
          
          {photos.length > 1 && (
            <>
              <button className="nav-btn prev-btn" onClick={prevPhoto}>
                ‹
              </button>
              <button className="nav-btn next-btn" onClick={nextPhoto}>
                ›
              </button>
              
              <div className="photo-counter">
                {currentIndex + 1} / {photos.length}
              </div>
            </>
          )}
        </div>
        
        {photos.length > 1 && (
          <div className="photo-thumbnails">
            {photos.map((photo, index) => (
              <div
                key={index}
                className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToPhoto(index)}
              >
                <img src={photo} alt={`Превʼю ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>

      {isFullscreen && (
        <div className="fullscreen-overlay" onClick={() => setIsFullscreen(false)}>
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-fullscreen"
              onClick={() => setIsFullscreen(false)}
            >
              ✕
            </button>
            
            <img 
              src={photos[currentIndex]} 
              alt={`Фото ${currentIndex + 1}`}
              className="fullscreen-image"
            />
            
            {photos.length > 1 && (
              <>
                <button className="fullscreen-nav prev" onClick={prevPhoto}>
                  ‹
                </button>
                <button className="fullscreen-nav next" onClick={nextPhoto}>
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;