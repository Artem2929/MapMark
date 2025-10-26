import React, { useState } from 'react';
import VoiceReview from './VoiceReview';
import './FeatureHub.css';

const FeatureHub = ({ isReviewFormOpen = false }) => {
  const [activeFeature, setActiveFeature] = useState(null);

  return (
    <div className="feature-hub">
      {!isReviewFormOpen && (
        <div className="fab-container">
          <button 
            className={`fab main-fab ${activeFeature ? 'active' : ''}`}
            onClick={() => setActiveFeature(activeFeature === 'voice' ? null : 'voice')}
          >
            {activeFeature === 'voice' ? '✕' : '🎤'}
          </button>
        </div>
      )}

      {activeFeature === 'voice' && (
        <div className="feature-panel">
          <VoiceReview onCancel={() => setActiveFeature(null)} />
        </div>
      )}
    </div>
  );
};

export default FeatureHub;