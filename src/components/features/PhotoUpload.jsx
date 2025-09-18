import React, { useState, useRef } from 'react';
import './PhotoUpload.css';

const PhotoUpload = ({ photos, onPhotosChange, maxPhotos = 10 }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = fileArray.slice(0, remainingSlots);

    if (filesToProcess.length === 0) return;

    setUploading(true);
    
    Promise.all(
      filesToProcess.map(file => processFile(file))
    ).then(processedFiles => {
      const validFiles = processedFiles.filter(Boolean);
      onPhotosChange([...photos, ...validFiles]);
      setUploading(false);
    });
  };

  const processFile = (file) => {
    return new Promise((resolve) => {
      // Валідація типу файлу
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} не є зображенням`);
        resolve(null);
        return;
      }

      // Валідація розміру (макс 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} занадто великий. Максимальний розмір: 5MB`);
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Стиснення зображення
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Розрахунок нових розмірів (макс 1200px)
          const maxSize = 1200;
          let { width, height } = img;
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Малювання стисненого зображення
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            const processedFile = {
              id: Date.now() + Math.random(),
              file: blob,
              url: canvas.toDataURL('image/jpeg', 0.8),
              name: file.name,
              size: blob.size,
              originalSize: file.size
            };
            resolve(processedFile);
          }, 'image/jpeg', 0.8);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files) {
      handleFileSelect(files);
    }
    // Очистити input для можливості повторного вибору того ж файлу
    e.target.value = '';
  };

  const removePhoto = (photoId) => {
    onPhotosChange(photos.filter(photo => photo.id !== photoId));
  };

  const movePhoto = (fromIndex, toIndex) => {
    const newPhotos = [...photos];
    const [movedPhoto] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, movedPhoto);
    onPhotosChange(newPhotos);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="photo-upload">
      <div className="upload-stats">
        <span className="photo-count">
          {photos.length} / {maxPhotos} фото
        </span>
        {photos.length > 0 && (
          <span className="total-size">
            Загальний розмір: {formatFileSize(photos.reduce((sum, photo) => sum + photo.size, 0))}
          </span>
        )}
      </div>

      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''} ${photos.length >= maxPhotos ? 'disabled' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={photos.length < maxPhotos ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        
        {uploading ? (
          <div className="uploading-state">
            <div className="spinner">🔄</div>
            <p>Обробка фото...</p>
          </div>
        ) : photos.length >= maxPhotos ? (
          <div className="upload-disabled">
            <div className="upload-icon">📸</div>
            <p>Досягнуто максимальну кількість фото</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon">📷</div>
            <p>Перетягніть фото сюди або натисніть для вибору</p>
            <span className="upload-hint">
              Підтримуються: JPG, PNG, GIF (макс. 5MB кожне)
            </span>
          </div>
        )}
      </div>

      {photos.length > 0 && (
        <div className="photos-grid">
          {photos.map((photo, index) => (
            <div key={photo.id} className="photo-item">
              <div className="photo-preview">
                <img src={photo.url} alt={photo.name} />
                <div className="photo-overlay">
                  <button
                    className="remove-photo"
                    onClick={() => removePhoto(photo.id)}
                    title="Видалити фото"
                  >
                    ✕
                  </button>
                  {index > 0 && (
                    <button
                      className="move-photo move-left"
                      onClick={() => movePhoto(index, index - 1)}
                      title="Перемістити ліворуч"
                    >
                      ←
                    </button>
                  )}
                  {index < photos.length - 1 && (
                    <button
                      className="move-photo move-right"
                      onClick={() => movePhoto(index, index + 1)}
                      title="Перемістити праворуч"
                    >
                      →
                    </button>
                  )}
                </div>
                {index === 0 && (
                  <div className="main-photo-badge">
                    Головне фото
                  </div>
                )}
              </div>
              <div className="photo-info">
                <div className="photo-name">{photo.name}</div>
                <div className="photo-size">
                  {formatFileSize(photo.size)}
                  {photo.originalSize !== photo.size && (
                    <span className="compression-info">
                      (стиснено з {formatFileSize(photo.originalSize)})
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {photos.length > 0 && (
        <div className="upload-tips">
          <h4>💡 Поради для кращих фото:</h4>
          <ul>
            <li>Перше фото буде головним у вашому оголошенні</li>
            <li>Використовуйте яскраве освітлення</li>
            <li>Показуйте різні ракурси вашого місця</li>
            <li>Уникайте розмитих або темних знімків</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;