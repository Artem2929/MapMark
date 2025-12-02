import React, { useState, memo } from 'react';

const QuickReviewForm = memo(({  onClose, onSubmit  }) => {
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location.trim()) {
      alert('Будь ласка, вкажіть місце');
      return;
    }
    
    if (onSubmit) {
      onSubmit({
        location: location.trim(),
        rating,
        comment: comment.trim(),
        date: new Date().toISOString()
      });
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: 0, color: '#333', fontSize: '20px' }}>Додати відгук</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
              padding: '4px',
              borderRadius: '4px'
            }}
          >✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>
              Місце *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Назва місця або адреса..."
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>
              Оцінка
            </label>
            <select 
              value={rating} 
              onChange={(e) => setRating(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value={5}>⭐⭐⭐⭐⭐ Відмінно</option>
              <option value={4}>⭐⭐⭐⭐ Добре</option>
              <option value={3}>⭐⭐⭐ Нормально</option>
              <option value={2}>⭐⭐ Погано</option>
              <option value={1}>⭐ Жахливо</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>
              Коментар
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Поділіться враженнями про це місце..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
                minHeight: '80px'
              }}
            />
          </div>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                color: '#6c757d'
              }}
            >
              Скасувати
            </button>
            <button 
              type="submit"
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                background: '#007bff',
                border: '1px solid #007bff',
                color: 'white'
              }}
            >
              Додати відгук
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

QuickReviewForm.displayName = 'QuickReviewForm';

export default QuickReviewForm;