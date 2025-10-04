import React, { useState } from 'react';
import './PhotoUpload.css';

const PhotoUpload = ({ photos = [], onPhotosChange, maxPhotos = 10 }) => {
  const handleFileSelect = (files) => {
    const newFiles = Array.from(files).slice(0, maxPhotos - photos.length);
    const newPhotos = [...photos];
    
    newFiles.forEach(file => {
      const localUrl = URL.createObjectURL(file);
      newPhotos.push(localUrl);
    });
    
    onPhotosChange(newPhotos);
  };

  const handleFileInput = (e) => {
    handleFileSelect(e.target.files);
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="photo-upload">
      <div className="review-form-photo-upload">
        <input
          type="file"
          id="photo-upload-input"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          hidden
        />
        <label htmlFor="photo-upload-input" className="review-form-photo-upload-btn">
          📷 {photos.length > 0 ? `Додати ще фото (${photos.length}/${maxPhotos})` : 'Додати фото'}
        </label>
      </div>
      
      {photos.length > 0 && (
        <div className="review-photo-preview-container">
          {photos.map((photo, index) => (
            <div key={index} className="review-photo-item">
              <div className="review-photo-preview">
                <img 
                  src={photo} 
                  alt={`Preview ${index + 1}`}
                  className="review-form-photo-preview-img"
                />
              </div>
              <button
                type="button"
                className="review-photo-remove-btn"
                onClick={() => removePhoto(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;