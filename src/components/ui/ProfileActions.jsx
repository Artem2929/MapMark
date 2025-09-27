import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileActions.css';

const ProfileActions = ({ isOwnProfile, onEditProfile }) => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: '🗺️',
      label: 'Дослідити місця',
      onClick: () => navigate('/discover-places'),
      color: '#3b82f6'
    },
    {
      icon: '📝',
      label: 'Додати відгук',
      onClick: () => navigate('/discover-places'),
      color: '#10b981'
    },
    {
      icon: '💬',
      label: 'Повідомлення',
      onClick: () => navigate('/messages'),
      color: '#8b5cf6'
    },
    {
      icon: '⚙️',
      label: 'Налаштування',
      onClick: onEditProfile,
      color: '#64748b',
      ownProfileOnly: true
    }
  ];

  const visibleActions = actions.filter(action => 
    !action.ownProfileOnly || (action.ownProfileOnly && isOwnProfile)
  );

  return (
    <div className="profile-actions">
      <h4>Швидкі дії</h4>
      <div className="actions-grid">
        {visibleActions.map((action, index) => (
          <button
            key={index}
            className="action-btn"
            onClick={action.onClick}
            style={{ '--action-color': action.color }}
          >
            <div className="action-icon">{action.icon}</div>
            <div className="action-label">{action.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileActions;