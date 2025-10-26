import React from 'react';
import './VoiceReview.css';

const VoiceReview = ({ onCancel }) => {
  return (
    <div className="voice-review">
      <div className="voice-header">
        <h3>🎤 Голосовий відгук</h3>
        <button className="close-btn" onClick={onCancel}>✕</button>
      </div>
      <div className="recording-area">
        <p>Функція голосових відгуків тимчасово недоступна</p>
      </div>
    </div>
  );
};

export default VoiceReview;