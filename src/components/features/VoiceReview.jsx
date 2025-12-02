import React, { memo } from 'react';
import { classNames } from '../../utils/classNames';
import './VoiceReview.css';

const VoiceReview = memo(({  onCancel  }) => {
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
});

VoiceReview.displayName = 'VoiceReview';

export default VoiceReview;