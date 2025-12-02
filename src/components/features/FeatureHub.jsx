import React, { useState, memo, useCallback } from 'react';
import { classNames } from '../../utils/classNames';
import VoiceReview from './VoiceReview';
import './FeatureHub.css';

const FeatureHub = memo(({  isReviewFormOpen = false  }) => {
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
});

FeatureHub.displayName = 'FeatureHub';

export default FeatureHub;