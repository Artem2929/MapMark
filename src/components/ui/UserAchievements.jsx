import React, { useState, useEffect } from 'react';

import './UserAchievements.css';

const UserAchievements = ({ userId }) => {
  const reviews = []; const reviewsLoading = false;
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Завантажити досягнення з API
    setAchievements([]);
    setLoading(false);
  }, [userId]);

  if (loading) {
    return (
      <div className="user-achievements loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="user-achievements">
      <h3>Досягнення ({achievements.filter(a => a.unlocked).length})</h3>
      
      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-content">
              <div className="achievement-title">{achievement.title}</div>
              <div className="achievement-description">{achievement.description}</div>
              {!achievement.unlocked && achievement.progress !== undefined && (
                <div className="achievement-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(achievement.progress / (achievement.id === 'hundred-reviews' ? 100 : 10)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {achievement.progress}/{achievement.id === 'hundred-reviews' ? 100 : 10}
                  </div>
                </div>
              )}
              {achievement.unlocked && achievement.date && (
                <div className="achievement-date">
                  {new Date(achievement.date).toLocaleDateString('uk-UA')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserAchievements;