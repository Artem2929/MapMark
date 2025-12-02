import React, { memo } from 'react';
import { classNames } from '../../utils/classNames';
import './EmptyState.css';

const EmptyState = memo(({  icon, title, description, action  }) => {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;