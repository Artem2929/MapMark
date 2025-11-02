import React, { useState, useRef } from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import { usePhotoUpload } from '../../hooks/usePhotoUpload';
import Toast from '../ui/Toast';

const PhotoUploadModal = ({ onClose }) => {
  const { targetUserId, photos } = useProfile();
  const { uploadPhoto, uploading } = usePhotoUpload();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [description, setDescription] = useState('');
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedPhoto({
        file,
        preview: e.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedPhoto) return;

    try {
      await uploadPhoto(selectedPhoto.file, description, targetUserId);
      setToast({ message: 'Фото успішно додано!', type: 'success' });
      setTimeout(() => {
        onClose();
        photos.refreshPhotos?.();
      }, 1000);
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const event = { target: { files: [file] } };
      handleFileSelect(event);
    }
  };

  return (
    <div className="photo-upload-modal" onClick={onClose}>
      <div className="photo-upload-content" onClick={(e) => e.stopPropagation()}>
        <div className="photo-upload-header">
          <h3>Додати нове фото</h3>
          <button onClick={onClose}>×</button>
        </div>
        
        <div className="photo-upload-body">
          {!selectedPhoto ? (
            <div 
              className="photo-drop-zone"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <p>Перетягніть фото сюди або натисніть для вибору</p>
            </div>
          ) : (
            <>
              <img src={selectedPhoto.preview} alt="Попередній перегляд" className="photo-preview" />
              <textarea
                placeholder="Напишіть опис..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <div className="photo-upload-actions">
            <button onClick={onClose}>Скасувати</button>
            <button 
              onClick={handleSubmit}
              disabled={!selectedPhoto || uploading}
            >
              {uploading ? 'Завантаження...' : 'Опублікувати'}
            </button>
          </div>
        </div>
      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default PhotoUploadModal;