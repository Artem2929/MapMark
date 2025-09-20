import React from 'react';
import './ProgressWidget.css';

const ProgressWidget = ({ userProgress }) => {
  if (!userProgress) {
    return null;
  }

  return (
    <div className="progress-widget">
      <div className="progress-info">
        <span className="level-badge">
          {userProgress.currentLevel?.icon} Рівень {userProgress.level}
        </span>
        <span className="points-badge">
          {userProgress.points} балів
        </span>
      </div>
      <div className="progress-bar-mini">
        <div 
          className="progress-fill-mini"
          style={{ width: `${userProgress.progressToNext}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressWidget;