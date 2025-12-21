import React from 'react';

const MarkerPopup = ({ marker, onClose }) => {
  return (
    <div className="marker-popup">
      <h3>{marker?.title || 'Маркер'}</h3>
      <p>{marker?.description || 'Опис маркера'}</p>
      <button onClick={onClose}>Закрити</button>
    </div>
  );
};

export default MarkerPopup;