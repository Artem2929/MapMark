import React, { memo } from 'react';
import { classNames } from '../../utils/classNames';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = memo(({  isOpen, onClose  }) => {



  if (!isOpen) return null;

AnalyticsDashboard.displayName = 'AnalyticsDashboard';

  return (
    <div className="analytics-overlay">
      <div className="analytics-dashboard">
        <div className="dashboard-header">
          <h2>📊 Аналітика</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="dashboard-content">
          <p>Аналітика тимчасово недоступна</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;