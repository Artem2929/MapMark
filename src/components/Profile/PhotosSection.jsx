import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../contexts/ProfileContext';
import PhotoUploadModal from './PhotoUploadModal';

const PhotosSection = () => {
  const navigate = useNavigate();
  const { photos, isOwnProfile } = useProfile();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="profile-photos-section">
      <div className="profile-photos-header">
        <h3>Фото ({photos.length})</h3>
        {isOwnProfile && (
          <button 
            className="add-photo-btn"
            onClick={() => setShowModal(true)}
          >
            <span>+</span> Додати фото
          </button>
        )}
      </div>
      
      <div className="profile-photos-grid">
        {photos.length > 0 ? (
          photos.slice(0, 3).map((photo, index) => (
            <div key={photo._id} className="photo-item" onClick={() => navigate('/photos')}>
              <img src={photo.url} alt="Фото" />
              {index === 2 && photos.length > 3 && (
                <div className="photo-overlay">
                  <span>+{photos.length - 3}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-photos">
            <p>Немає фото</p>
          </div>
        )}
      </div>

      {showModal && (
        <PhotoUploadModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default PhotosSection;