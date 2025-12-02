import React, { memo } from 'react';
import { classNames } from '../../utils/classNames';

const AddReviewButton = memo(({  onClick  }) => {
  return (
    <button 
      className="add-review-btn"
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(0, 123, 255, 0.3)',
        transition: 'all 0.3s ease',
        zIndex: 1000
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 6px 25px rgba(0, 123, 255, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 20px rgba(0, 123, 255, 0.3)';
      }}
    >
      <span style={{ fontSize: '16px' }}>📝</span>
      <span>Додати відгук</span>
    </button>
  );
});

AddReviewButton.displayName = 'AddReviewButton';

export default AddReviewButton;