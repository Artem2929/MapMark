import React from 'react';
import './LoadingSkeleton.css';

const LoadingSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton-header">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-author-info">
              <div className="skeleton-name"></div>
              <div className="skeleton-time"></div>
            </div>
          </div>
          <div className="skeleton-image"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-description"></div>
            <div className="skeleton-location"></div>
          </div>
          <div className="skeleton-actions">
            <div className="skeleton-action-btn"></div>
            <div className="skeleton-action-btn"></div>
            <div className="skeleton-action-btn"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default LoadingSkeleton;