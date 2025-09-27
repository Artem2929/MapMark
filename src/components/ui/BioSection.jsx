import React from 'react';
import './BioSection.css';

const BioSection = ({ bio, isEditing, editedBio, setEditedBio, onKeyPress }) => {
  return (
    <div className="bio-section">
      <div className="bio-header">
        <h4 className="bio-label">Про себе</h4>
        <div className="bio-icon">📖</div>
      </div>
      {isEditing ? (
        <textarea
          value={editedBio}
          onChange={(e) => setEditedBio(e.target.value)}
          onKeyDown={onKeyPress}
          className="bio-input"
          placeholder="Розкажіть про себе..."
          rows="4"
          maxLength="500"
        />
      ) : (
        <div className="bio-content">
          <p className="bio-text">{bio || 'Користувач поки що не розповів про себе'}</p>
          {bio && (
            <div className="bio-length">{bio.length}/500</div>
          )}
        </div>
      )}
    </div>
  );
};

export default BioSection;