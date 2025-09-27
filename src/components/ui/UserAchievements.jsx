import React, { useState, useEffect } from 'react';

import './UserAchievements.css';

const UserAchievements = ({ userId }) => {
  const reviews = []; const reviewsLoading = false;
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock achievements data
    const mockAchievements = [
      {
        id: 'first-review',
        title: 'Перший крок',
        description: 'Залишив перший відгук',
        icon: '🎯',
        unlocked: true,
        date: '2024-01-15'
      },
      {
        id: 'ten-reviews',
        title: 'Активний мандрівник',
        description: 'Залишив 10 відгуків',
        icon: '🌟',
        unlocked: true,
        date: '2024-03-20'
      },
      {
        id: 'world-traveler',
        title: 'Світовий мандрівник',
        description: 'Відвідав 3 країни',
        icon: '🌍',
        unlocked: true
      },
      {
        id: 'hundred-reviews',
        title: 'Експерт',
        description: 'Залишити 100 відгуків',
        icon: '🏆',
        unlocked: false,
        progress: 15
      },
      {
        id: 'ten-countries',
        title: 'Глобальний дослідник',
        description: 'Відвідати 10 країн',
        icon: '🗺️',
        unlocked: false,
        progress: 3
      }
    ];

    setAchievements(mockAchievements);
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